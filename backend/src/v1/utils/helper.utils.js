const { QueryTypes } = require('sequelize');
const { format } = require('sql-formatter');

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

module.exports = {
  ddl
}