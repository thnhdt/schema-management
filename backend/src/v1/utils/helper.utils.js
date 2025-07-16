const { QueryTypes } = require('sequelize');
const { format } = require('sql-formatter');
const dbdiff = require('./pg-schema-diff');
const databaseModel = require('../models/database.model');
const nodeModel = require('../models/node.model');
var util = require('util')
const { NotFoundError } = require('../cores/error.response');

function fmtType(r) {
  if (r.data_type === 'character varying')
    return r.character_maximum_length
      ? `varchar(${r.character_maximum_length})`
      : 'varchar';

  if (r.data_type === 'numeric')
    return `numeric(${r.numeric_precision},${r.numeric_scale})`;

  if (r.data_type === 'integer' || r.udt_name === 'int4')
    return 'int';          // 32‑bit
  if (r.data_type === 'bigint' || r.udt_name === 'int8')
    return 'bigint';       // 64‑bit
  if (r.data_type === 'smallint' || r.udt_name === 'int2')
    return 'smallint';     // 16‑bit

  if (r.data_type === 'timestamp without time zone')
    return 'timestamp';
  if (r.data_type === 'timestamp with time zone')
    return 'timestamptz';

  return r.udt_name || r.data_type;
}
function unescapeSqlString(str) {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

async function generateAllDdls(schema = 'public', tableNames, client) {
  const nameList = tableNames.map(name => `'${name.table_name}'`).join(',');
  const [columns, pks, uqs, fks, chks] = await Promise.all([
    client.query(
      `SELECT table_name, column_name, data_type, is_nullable, column_default, ordinal_position
       FROM information_schema.columns
       WHERE table_schema = :schema AND table_name IN (${nameList})
       ORDER BY table_name, ordinal_position`,
      { replacements: { schema }, type: QueryTypes.SELECT }
    ),
    client.query(
      `SELECT tc.table_name, tc.constraint_name, string_agg(kcu.column_name, ', ') AS cols
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu 
         ON tc.constraint_name = kcu.constraint_name
       WHERE tc.table_schema = :schema AND tc.constraint_type = 'PRIMARY KEY' 
         AND tc.table_name IN (${nameList})
       GROUP BY tc.table_name, tc.constraint_name`,
      { replacements: { schema }, type: QueryTypes.SELECT }
    ),
    client.query(
      `SELECT tc.table_name, tc.constraint_name, string_agg(kcu.column_name, ', ') AS cols
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu 
         ON tc.constraint_name = kcu.constraint_name
       WHERE tc.table_schema = :schema AND tc.constraint_type = 'UNIQUE' 
         AND tc.table_name IN (${nameList})
       GROUP BY tc.table_name, tc.constraint_name`,
      { replacements: { schema }, type: QueryTypes.SELECT }
    ),
    client.query(
      `SELECT tc.table_name, tc.constraint_name,
              string_agg(kcu.column_name, ', ') AS cols,
              ccu.table_schema AS ref_schema,
              ccu.table_name AS ref_table,
              string_agg(ccu.column_name, ', ') AS ref_cols
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu 
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage ccu
         ON tc.constraint_name = ccu.constraint_name
       WHERE tc.table_schema = :schema AND tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_name IN (${nameList})
       GROUP BY tc.table_name, tc.constraint_name, ccu.table_schema, ccu.table_name`,
      { replacements: { schema }, type: QueryTypes.SELECT }
    ),
    client.query(
      `SELECT tc.table_name, cc.constraint_name, cc.check_clause
       FROM information_schema.table_constraints tc
       JOIN information_schema.check_constraints cc 
         ON tc.constraint_name = cc.constraint_name
       WHERE tc.table_schema = :schema AND tc.constraint_type = 'CHECK' 
         AND tc.table_name IN (${nameList})`,
      { replacements: { schema }, type: QueryTypes.SELECT }
    ),
  ]);

  const groupByTable = rows =>
    rows.reduce((acc, row) => {
      const t = row.table_name;
      if (!acc[t]) acc[t] = [];
      acc[t].push(row);
      return acc;
    }, {});

  const groupedCols = groupByTable(columns);
  const groupedPks = groupByTable(pks);
  const groupedUqs = groupByTable(uqs);
  const groupedFks = groupByTable(fks);
  const groupedChks = groupByTable(chks);

  const ddlMap = new Map();

  for (const tableOb of tableNames) {
    const table = tableOb.table_name;
    const cols = groupedCols[table] || [];
    const pk = groupedPks[table] || [];
    const uq = groupedUqs[table] || [];
    const fk = groupedFks[table] || [];
    const chk = groupedChks[table] || [];

    const colLines = cols.map((c) => {
      const parts = [
        `  "${c.column_name}"`,
        fmtType(c),
        c.column_default ? `DEFAULT ${c.column_default}` : "",
        c.is_nullable === "NO" ? "NOT NULL" : "",
      ].filter(Boolean);
      return parts.join(" ");
    });

    const pkLines = pk.map(r => `  CONSTRAINT "${r.constraint_name}" PRIMARY KEY (${r.cols})`);
    const uqLines = uq.map(r => `  CONSTRAINT "${r.constraint_name}" UNIQUE (${r.cols})`);
    const fkLines = fk.map(
      r =>
        `  CONSTRAINT "${r.constraint_name}" FOREIGN KEY (${r.cols}) REFERENCES "${r.ref_schema}"."${r.ref_table}" (${r.ref_cols})`
    );
    const chkLines = chk.map(r => `  CONSTRAINT "${r.constraint_name}" CHECK (${r.check_clause})`);

    const allLines = [...colLines, ...pkLines, ...uqLines, ...fkLines, ...chkLines];
    const rawDdl = `CREATE TABLE "${schema}"."${table}" (\n` + allLines.join(',\n') + `\n);`;

    const rawSql = unescapeSqlString(rawDdl.replace(/^"|"$/g, ''));
    const formattedSql = format(rawSql, {
      language: 'postgresql'
    });
    ddlMap.set(table, formattedSql);
  }
  return ddlMap;
}
const ddl = async (schema, table, client) => {
  try {
    /* ---------- COLUMNS TYPE ------------------------------------------------ */
    const cols = await client.query(
      `SELECT *
       FROM information_schema.columns
      WHERE table_schema = :schema
        AND table_name   = :table
      ORDER BY ordinal_position`,
      {
        replacements: { schema, table },
        type: QueryTypes.SELECT
      }
    );
    /* ---------- PRIMARY KEY ------------------------------------------------ */
    const pk = await client.query(
      `SELECT tc.constraint_name,
          string_agg(kcu.column_name, ', ') AS cols
     FROM information_schema.table_constraints      tc
     JOIN information_schema.key_column_usage       kcu
       ON kcu.constraint_name  = tc.constraint_name
      AND kcu.constraint_schema = tc.constraint_schema
    WHERE tc.table_schema   = :schema
      AND tc.table_name     = :table
      AND tc.constraint_type = 'PRIMARY KEY'
    GROUP BY tc.constraint_name`,
      {
        replacements: { schema, table },
        type: QueryTypes.SELECT
      }
    );

    /* ---------- UNIQUE CONSTRAINTS ---------------------------------------- */
    const uniq = await client.query(
      `SELECT tc.constraint_name,
          string_agg(kcu.column_name, ', ') AS cols
     FROM information_schema.table_constraints      tc
     JOIN information_schema.key_column_usage       kcu
       ON kcu.constraint_name  = tc.constraint_name
      AND kcu.constraint_schema = tc.constraint_schema
    WHERE tc.table_schema   = :schema
      AND tc.table_name     = :table
      AND tc.constraint_type = 'UNIQUE'
    GROUP BY tc.constraint_name`,
      {
        replacements: { schema, table },
        type: QueryTypes.SELECT
      }
    );

    /* ---------- FOREIGN KEYS ---------------------------------------------- */
    const fks = await client.query(
      `SELECT tc.constraint_name,
          string_agg(kcu.column_name, ', ') AS cols,
          ccu.table_schema                  AS ref_schema,
          ccu.table_name                    AS ref_table,
          string_agg(ccu.column_name, ', ') AS ref_cols
     FROM information_schema.table_constraints      tc
     JOIN information_schema.key_column_usage       kcu
       ON kcu.constraint_name  = tc.constraint_name
      AND kcu.constraint_schema = tc.constraint_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name  = tc.constraint_name
      AND ccu.constraint_schema = tc.constraint_schema
    WHERE tc.table_schema   = :schema
      AND tc.table_name     = :table
      AND tc.constraint_type = 'FOREIGN KEY'
    GROUP BY tc.constraint_name, ccu.table_schema, ccu.table_name`,
      {
        replacements: { schema, table },
        type: QueryTypes.SELECT
      }
    );

    /* ---------- CHECK CONSTRAINTS ----------------------------------------- */
    const checks = await client.query(
      `SELECT cc.constraint_name,
          cc.check_clause
     FROM information_schema.table_constraints tc
     JOIN information_schema.check_constraints cc
       ON cc.constraint_name  = tc.constraint_name
      AND cc.constraint_schema = tc.constraint_schema
    WHERE tc.table_schema   = :schema
      AND tc.table_name     = :table
      AND tc.constraint_type = 'CHECK'`,
      {
        replacements: { schema, table },
        type: QueryTypes.SELECT
      }
    );

    const colLines = cols.map((c) => {
      const parts = [
        `  "${c.column_name}"`,
        fmtType(c),
        c.column_default ? `DEFAULT ${c.column_default}` : "",
        c.is_nullable === "NO" ? "NOT NULL" : "",
      ].filter(Boolean);
      return parts.join(" ");
    });

    const pkLines = pk.map((r) =>
      `  CONSTRAINT "${r.constraint_name}" PRIMARY KEY (${r.cols})`
    );

    const uniqLines = uniq.map((r) =>
      `  CONSTRAINT "${r.constraint_name}" UNIQUE (${r.cols})`
    );

    const fkLines = fks.map((r) =>
      `  CONSTRAINT "${r.constraint_name}" FOREIGN KEY (${r.cols}) REFERENCES "${r.ref_schema}"."${r.ref_table}" (${r.ref_cols})`
    );

    const chkLines = checks.map((r) =>
      `  CONSTRAINT "${r.constraint_name}" CHECK (${r.check_clause})`
    );

    const lines = [...colLines, ...pkLines, ...uniqLines, ...fkLines, ...chkLines];
    const ddl = `CREATE TABLE "${schema}"."${table}" (
` + lines.join(',') + `);`;

    const rawSql = unescapeSqlString(ddl.replace(/^"|"$/g, ''));

    const formattedSql = format(rawSql, {
      language: 'postgresql'
    });
    return formattedSql;
  } catch (error) {
    console.error(`Error generating DDL for ${schema}.${table}:`, error.message);
    throw new Error(`Failed to generate DDL for table ${table}: ${error.message}`);
  }
}
//////////////////////////////////////////////////
const ddlPatterns = [
  // ----- TABLE -----
  { type: 'CREATE', target: 'TABLE', re: /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
  // { type: 'DELETE', target: 'TABLE', re: /drop\s+table\s+(?:if\s+exists\s+)?(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
  // { type: 'UPDATE', target: 'TABLE', re: /alter\s+table\s+(?:only\s+)?(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
  { type: 'UPDATE', target: 'TABLE', re: /alter\s+table\s+(?:only\s+)?(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`](?!.*\b(drop\s+column|alter\s+column\s+["`]?[\w]+["`]?\s+set\s+(data\s+type|not\s+null))\b).*$/i },
  { type: 'UPDATE', target: 'TABLE', re: /create\s+(?:unique\s+|bitmap\s+)?index\s+(?:if\s+not\s+exists\s+)?["`]?[\w]+["`]?\s+on\s+(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
  { type: 'UPDATE', target: 'TABLE', re: /drop\s+index\s+(?:concurrently\s+)?(?:if\s+exists\s+)?["`]?[\w]+["`]?\s+on\s+(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
  { type: 'UPDATE', target: 'TRIGGER', re: /create\s+(?:or\s+replace\s+)?trigger\s+["`]?([\w]+)["`]?\s+(?:before|after|instead\s+of)\s+[\w\s,]+\s+on\s+(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?(?:\s+for\s+each\s+row)?(?:\s+when\s*\(.*?\))?/i },
  { type: 'UPDATE', target: 'TRIGGER', re: /drop\s+trigger\s+(?:if\s+exists\s+)?["`]?([\w]+)["`]?\s+on\s+(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
];
const ddlPatternsSequence = [
  // ----- SEQUENCE -----
  { type: 'CREATE', re: /create\s+sequence\s+(?:if\s+not\s+exists\s+)?(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
  { type: 'DELETE', re: /drop\s+sequence\s+(?:if\s+exists\s+)?(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },]
const ddlPatternsIndex = [
  // ----- INDEX -----
  { type: 'CREATE', re: /create\s+(?:unique\s+|bitmap\s+)?index\s+(?:if\s+not\s+exists\s+)?["`]?[\w]+["`]?\s+on\s+(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
  { type: 'DELETE', re: /drop\s+index\s+(?:concurrently\s+)?(?:if\s+exists\s+)?["`]?[\w]+["`]?\s+on\s+(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i },
]
const ddlPatternsLog = [
  {
    type: 'UPDATE',
    target: 'drop_column',
    re: /alter\s+table\s+"([\w]+)"\s+drop\s+column\s+"([\w]+)"/i
  },
  {
    type: 'UPDATE',
    target: 'set_type',
    re: /alter\s+table\s+"([\w]+)"\s+alter\s+column\s+"([\w]+)"\s+set\s+data\s+type\s+(.+)/i
  },
  {
    type: 'UPDATE',
    target: 'set_not_null',
    re: /alter\s+table\s+"([\w]+)"\s+alter\s+column\s+"([\w]+)"\s+set\s+not\s+null/i
  },
  {
    type: 'DELETE',
    target: 'drop_table',
    re: /drop\s+table\s+(?:if\s+exists\s+)?(?:["`]?[\w]+["`]?\.)?["`]?([\w]+)["`]?/i
  }
]
const PRIORITY = { CREATE: 3, DELETE: 2, UPDATE: 1 };
const sortPriority = (a, b) => PRIORITY[b.type] - PRIORITY[a.type];
function parseDDL(line) {
  for (const { re, type, target } of ddlPatterns) {
    const m = line.match(re);
    if (m) {
      if (target === 'TRIGGER') {
        return {
          type,
          target,
          name: m[1],
          table: m[2],
        };
      }
      return {
        type,
        target,
        table: m[1],
      };
    }
  }
  return null;
}

function parseDDLSequence(line) {
  for (const { re, type } of ddlPatternsSequence) {
    const m = line.match(re);
    if (m) return { key: m[0], sequence: m[1], type };
  }
  return null;
}
function parseDDLIndex(line) {
  for (const { re, type } of ddlPatternsIndex) {
    const m = line.match(re);
    if (m) return { key: m[0], index: m[1], type };
  }
  return null;
}
function parseDDLLog(line) {
  for (const { re, target, type } of ddlPatternsLog) {
    const m = line.match(re);
    if (m) return { key: m[0], table: m[1], type, target };
  }
  return null;
}

const getStringUrl = async (id) => {
  const targetDatabase = await databaseModel.findById(id).lean();
  if (!targetDatabase) throw new NotFoundError("Không tồn tại database!");
  const targetNode = await nodeModel.findById(targetDatabase.nodeId).lean();
  if (!targetNode) throw new NotFoundError("Không tồn tại node!");
  const stringConnectPGUrl = `postgres://${targetDatabase.username}:${targetDatabase.password}@${targetNode.host}:${Number(targetNode.port)}/${targetDatabase.database}`
  return { stringConnectPGUrl, database: `${targetDatabase.username}:${targetDatabase.database}` };
}
const getAllUpdateBetweenDatabases = async (
  targetDatabaseUrl,
  currentDatabaseUrl,
  schema = 'public',
  listTablePriority
) => {
  const allLines = [];
  dbdiff.logger = msg => allLines.push(msg);

  await dbdiff.compareDatabases({
    current: { conn: currentDatabaseUrl, schema },
    target: { conn: targetDatabaseUrl, schema }
  }, listTablePriority);
  return allLines;
};

const getAllUpdateOnTableUtil = async (targetDatabaseId, currentDatabaseId, mapTables, listTablePriority) => {
  const [targetDatabaseUrl, currentDatabaseUrl] = await Promise.all([getStringUrl(targetDatabaseId), getStringUrl(currentDatabaseId)]);
  const allUpdate = await getAllUpdateBetweenDatabases(
    targetDatabaseUrl.stringConnectPGUrl, currentDatabaseUrl.stringConnectPGUrl, 'public', listTablePriority
  );
  const sequence = [];
  const index = [];
  const log = [];
  for (const line of allUpdate) {
    const info = parseDDL(line);
    // console.log(line);
    if (!info) {
      if (parseDDLSequence(line)) {
        sequence.push({ key: parseDDLSequence(line).sequence, ddl: line, type: parseDDLSequence(line).type })
      }
      else if (parseDDLIndex(line)) {
        index.push({ key: parseDDLIndex(line).index, ddl: line, type: parseDDLIndex(line).type })
      }
      else if (parseDDLLog(line)) {
        const { table, type } = parseDDLLog(line);
        if (!mapTables.has(table)) continue;
        const objectTabel = mapTables.get(table);
        if (!objectTabel?.stmts && !objectTabel?.type) {
          objectTabel.stmts = [line];
          objectTabel.type = type;
        }
        else {
          objectTabel.stmts.push(line);
          if (PRIORITY[type] > PRIORITY[objectTabel.type]) {
            objectTabel.type = type;
          }
        }
        log.push({ key: parseDDLLog(line).key, type: parseDDLLog(line).type, target: parseDDLLog(line).target, ddl: line, table: table })
      }
      continue;
    }
    const { table, type } = info;
    if (!mapTables.has(table)) continue;
    const objectTabel = mapTables.get(table);
    if (!objectTabel?.stmts && !objectTabel?.type) {
      objectTabel.stmts = [line];
      objectTabel.type = type;
    }
    else {
      objectTabel.stmts.push(line);
      if (PRIORITY[type] > PRIORITY[objectTabel.type]) {
        objectTabel.type = type;
      }
    }
  }
  return {
    updateSchema: allUpdate.filter(line =>
      !(log.some(entry => entry.ddl.trim() === line.trim()))),
    // updateSchema: allUpdate,
    mapTables,
    targetDatabase: targetDatabaseUrl.database,
    currentDatabase: currentDatabaseUrl.database,
    sequence,
    index,
    log: log.sort(sortPriority)
  };
}
function isNumber(n) {
  return +n == n
}
function sequenceDescription(sequence) {
  return util.format('CREATE SEQUENCE IF NOT EXISTS \"%s\" INCREMENT %s %s %s %s %s CYCLE;',
    sequence.sequence_name,
    sequence.increment,
    isNumber(sequence.minimum_value) ? 'MINVALUE ' + sequence.minimum_value : 'NO MINVALUE',
    isNumber(sequence.maximum_value) ? 'MAXVALUE ' + sequence.maximum_value : 'NO MAXVALUE',
    isNumber(sequence.start_value) ? 'START ' + sequence.start_value : '',
    sequence.cycle_option === 'NO' ? 'NO' : ''
  )
}

const timeFormat = (dateTime) => {
  const utcTime = new Date(dateTime);
  const vietnamOffsetMs = 7 * 60 * 60 * 1000;

  const vietnamTime = new Date(utcTime.getTime() + vietnamOffsetMs);
  return vietnamTime.toISOString().replace('T', ' ').substring(0, 19);
}
module.exports = {
  ddl,
  getAllUpdateOnTableUtil,
  getAllUpdateBetweenDatabases,
  getStringUrl,
  sequenceDescription,
  timeFormat,
  generateAllDdls,
  sortPriority
}