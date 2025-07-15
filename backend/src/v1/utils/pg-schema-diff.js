#!/usr/bin/env node

var txain = require('txain')
var multiline = require('multiline')
var _ = require('underscore')
var pg = require('pg')
var util = require('util')

var dbdiff = module.exports = {}

const { Pool } = require('pg');
const groupBy = (arr, key) =>
  arr.reduce((acc, cur) => {
    (acc[cur[key]] = acc[cur[key]] || []).push(cur);
    return acc;
  }, {});
function ddlTrigger(trigger) {
  const allManipulations = trigger.event_manipulation.join(' OR ');
  return `CREATE OR REPLACE TRIGGER \"${trigger.trigger_name}\" ${trigger.action_timing} ${allManipulations} ON "${trigger.event_object_table}" FOR EACH ${trigger.action_orientation} ${trigger.action_condition ? `WHEN ${trigger.action_condition} ` : ''}${trigger.action_statement};`
}
dbdiff.log = function () {
  var msg = util.format.apply(null, Array.prototype.slice.call(arguments))
  dbdiff.logger(msg)
}

// dbdiff.describeDatabase = function (conString, schemaname, callback) {
//   const client = new pg.Client(conString);
//   // const client = new Pool({
//   //   connectionString: conString,
//   //   max: 20,
//   //   idleTimeoutMillis: 30000,
//   //   connectionTimeoutMillis: 2000,
//   // });
//   const schema = { tables: {} };

//   txain(function (callback) {
//     client.connect(callback);
//   })
//     .then(function (client, done, callback) {
//       client.query('SELECT * FROM pg_tables WHERE schemaname = $1', [schemaname], callback);
//     })
//     .then(function (result, callback) {
//       const tables = result.rows;
//       callback(null, tables);
//     })

//     .map(function (table, callback) {
//       const tableName = table.tablename;
//       const columnsQuery = multiline(function () {/*
//         SELECT
//           table_name,
//           column_name,
//           data_type,
//           udt_name,
//           character_maximum_length,
//           is_nullable,
//           '' as column_default
//         FROM INFORMATION_SCHEMA.COLUMNS
//         WHERE table_name = $1 AND table_schema = $2;
//       */});

//       client.query(columnsQuery, [tableName, schemaname], function (err, result) {
//         if (err) return callback(err);

//         const columns = result.rows.map(row => {
//           delete row.table_name;
//           return row;
//         });

//         callback(null, { tableName, columns });
//       });
//     })

//     .then(function (columnTables, callback) {
//       columnTables.forEach(({ tableName, columns }) => {
//         schema.tables[tableName] = { columns, triggers: [] };
//       });

//       callback(null, columnTables.map(t => t.tableName)); // Truyền danh sách bảng cho bước sau
//     })

//     .map(function (tableName, callback) {
//       const triggersQuery = multiline(function () {/*
//         SELECT
//           event_object_table,
//           trigger_name,
//           event_manipulation,
//           action_statement,
//           action_timing,
//           action_orientation,
//           action_condition
//         FROM information_schema.triggers
//         WHERE event_object_table = $1
//         ORDER BY event_object_table, event_manipulation;
//       */});

//       client.query(triggersQuery, [tableName], function (err, result) {
//         if (err) return callback(err);

//         const map = new Map();
//         for (const item of result.rows) {
//           const key = item.trigger_name;
//           if (map.has(key)) {
//             map.get(key).event_manipulation.push(item.event_manipulation);
//           } else {
//             map.set(key, { ...item, event_manipulation: [item.event_manipulation] });
//           }
//         }

//         const triggers = Array.from(map).map(([key, value]) => ({ key, ...value }));

//         callback(null, { tableName, triggers });
//       });
//     })

//     .then(function (triggerTables, callback) {
//       triggerTables.forEach(({ tableName, triggers }) => {
//         if (!schema.tables[tableName]) {
//           schema.tables[tableName] = { columns: [], triggers: [] };
//         }
//         schema.tables[tableName].triggers = triggers;
//       });

//       callback(null);
//     })

//     .then(function (callback) {
//       const query = multiline(function () {/*
//         SELECT
//           i.relname as indname,
//           split_part(CAST(idx.indrelid::regclass as TEXT),'.',2),
//           am.amname as indam,
//           idx.indkey,
//           ARRAY(
//             SELECT pg_get_indexdef(idx.indexrelid, k + 1, true)
//             FROM generate_subscripts(idx.indkey, 1) as k
//             ORDER BY k
//           ) AS indkey_names,
//           idx.indexprs IS NOT NULL as indexprs,
//           idx.indpred IS NOT NULL as indpred,
//           ns.nspname,
//           t.relname AS tablename
//         FROM pg_index as idx
//         JOIN pg_class as i ON i.oid = idx.indexrelid
//         JOIN pg_am as am ON i.relam = am.oid
//         JOIN pg_class AS t ON t.oid = idx.indrelid
//         JOIN pg_namespace as ns ON ns.oid = i.relnamespace
//         AND ns.nspname NOT IN ('pg_catalog', 'pg_toast')
//         WHERE ns.nspname = $1;
//       */});

//       client.query(query, [schemaname], callback);
//     })

//     .then(function (indexes, callback) {
//       schema.indexes = indexes.rows;

//       const query = multiline(function () {/*
//         SELECT
//           con.conname AS constraint_name,
//           n.nspname AS schema_name,
//           rel.relname AS table_name,
//           con.contype AS constraint_type,
//           pg_get_constraintdef(con.oid) AS definition
//         FROM pg_constraint con
//         JOIN pg_class rel ON rel.oid = con.conrelid
//         JOIN pg_namespace n ON n.oid = rel.relnamespace
//         WHERE n.nspname = $1;
//       */});

//       client.query(query, [schemaname], callback);
//     })

//     .then(function (constraints, callback) {
//       schema.constraints = constraints.rows;

//       const query = multiline(function () {/*
//         SELECT 
//          sequence_name,
//          data_type,
//          numeric_precision,
//          numeric_precision_radix,
//          numeric_scale,
//          start_value,
//          minimum_value,
//          maximum_value,
//          increment,
//          cycle_option
//         FROM information_schema.sequences
//         WHERE sequence_schema = $1;
//       */});

//       client.query(query, [schemaname], callback);
//     })

//     .then(function (result, callback) {
//       schema.sequences = result.rows;
//       schema.sequences.forEach(sequence => {
//         sequence.name = sequence.sequence_name;
//       });

//       client.query('SELECT current_schema()', callback);
//     })

//     .end(function (err, result) {
//       client.end();
//       if (err) return callback(err);
//       // callback(null, schema);
//       return schema;
//     });
// };


dbdiff.describeDatabase = async function (conString, schemaname) {
  const client = new Pool({
    connectionString: conString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const schema = { tables: {}, indexes: [], constraints: [], sequences: [] };

  const connection = await client.connect();

  try {
    // Lấy danh sách bảng vả trigger
    const tablesRes = await connection.query(
      'SELECT * FROM pg_tables WHERE schemaname = $1',
      [schemaname]
    );
    const tables = tablesRes.rows;

    const columnsQuery = `
  SELECT
    table_name,
    column_name,
    data_type,
    udt_name,
    character_maximum_length,
    is_nullable,
    '' as column_default
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE table_schema = $1;
`;

    const triggersQuery = `
  SELECT
    event_object_table AS table_name,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation,
    action_condition
  FROM information_schema.triggers
  WHERE event_object_schema = $1
  ORDER BY event_object_table, trigger_name, event_manipulation;
`;

    const [columnsRes, triggersRes] = await Promise.all([
      connection.query(columnsQuery, [schemaname]),
      connection.query(triggersQuery, [schemaname])
    ]);

    const columnsGrouped = groupBy(columnsRes.rows, 'table_name');

    const triggerMapByTable = new Map();
    for (const row of triggersRes.rows) {
      const tbl = row.table_name;
      const key = row.trigger_name;
      if (!triggerMapByTable.has(tbl)) triggerMapByTable.set(tbl, new Map());

      const tblTriggerMap = triggerMapByTable.get(tbl);
      if (tblTriggerMap.has(key)) {
        tblTriggerMap.get(key).event_manipulation.push(row.event_manipulation);
      } else {
        tblTriggerMap.set(key, {
          ...row,
          event_manipulation: [row.event_manipulation],
        });
      }
    }

    for (const table of tables) {
      const tableName = table.tablename;
      const columns = columnsGrouped[tableName] || [];

      const triggersMap = triggerMapByTable.get(tableName) || new Map();
      const triggers = Array.from(triggersMap.values());

      schema.tables[tableName] = {
        columns,
        triggers,
      };
    }
    // Lấy danh sách indexes
    const indexesQuery = `
      SELECT
        i.relname as indname,
        split_part(CAST(idx.indrelid::regclass as TEXT),'.',2),
        am.amname as indam,
        idx.indkey,
        ARRAY(
          SELECT pg_get_indexdef(idx.indexrelid, k + 1, true)
          FROM generate_subscripts(idx.indkey, 1) as k
          ORDER BY k
        ) AS indkey_names,
        idx.indexprs IS NOT NULL as indexprs,
        idx.indpred IS NOT NULL as indpred,
        ns.nspname,
        t.relname AS tablename
      FROM pg_index as idx
      JOIN pg_class as i ON i.oid = idx.indexrelid
      JOIN pg_am as am ON i.relam = am.oid
      JOIN pg_class AS t ON t.oid = idx.indrelid
      JOIN pg_namespace as ns ON ns.oid = i.relnamespace
      AND ns.nspname NOT IN ('pg_catalog', 'pg_toast')
      WHERE ns.nspname = $1;
    `;

    const indexesRes = await connection.query(indexesQuery, [schemaname]);
    schema.indexes = indexesRes.rows;

    // Lấy danh sách constraints
    const constraintsQuery = `
      SELECT
        con.conname AS constraint_name,
        n.nspname AS schema_name,
        rel.relname AS table_name,
        con.contype AS constraint_type,
        pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname = $1;
    `;

    const constraintsRes = await connection.query(constraintsQuery, [schemaname]);
    schema.constraints = constraintsRes.rows;

    // Lấy sequences
    const sequencesQuery = `
      SELECT 
        sequence_name,
        data_type,
        numeric_precision,
        numeric_precision_radix,
        numeric_scale,
        start_value,
        minimum_value,
        maximum_value,
        increment,
        cycle_option
      FROM information_schema.sequences
      WHERE sequence_schema = $1;
    `;

    const sequencesRes = await connection.query(sequencesQuery, [schemaname]);
    schema.sequences = sequencesRes.rows.map(seq => ({
      ...seq,
      name: seq.sequence_name,
    }));

    return schema;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
    await client.end();
  }
}
function dataType(info) {
  var type
  if (info.data_type === 'ARRAY') {
    type = info.udt_name
    if (type.substring(0, 1) === '_') {
      type = type.substring(1)
    }
    type += '[]'
  } else if (info.data_type === 'USER-DEFINED') {
    type = info.udt_name // hstore for example
  } else {
    type = info.data_type
  }

  if (info.character_maximum_length) {
    type = type + '(' + info.character_maximum_length + ')'
  }
  return type
}

function columnNames(columns) {
  return columns.map(function (col) {
    return col.column_name
  }).sort()
}

function columnDescription(col) {
  var desc = dataType(col)
  if (col.column_default) {
    desc += ' DEFAULT ' + col.column_default
  }
  desc += col.is_nullable === 'NO' ? ' NOT NULL' : ' NULL'
  return desc
}

function compareTables(tableName, db1, db2) {
  var table1 = db1.tables[tableName].columns
  var table2 = db2.tables[tableName].columns

  var columNames1 = columnNames(table1)
  var columNames2 = columnNames(table2)

  var diff1 = _.difference(columNames1, columNames2)
  var diff2 = _.difference(columNames2, columNames1)

  diff1.forEach(function (columnName) {
    dbdiff.log('ALTER TABLE \"%s\" DROP COLUMN "%s";', tableName, columnName)
  })

  diff2.forEach(function (columnName) {
    var col = _.findWhere(table2, { column_name: columnName })
    var type = dataType(col)
    dbdiff.log('ALTER TABLE \"%s\" ADD COLUMN "%s" %s;', tableName, columnName, columnDescription(col))
  })

  var common = _.intersection(columNames1, columNames2)
  common.forEach(function (columnName) {
    var col1 = _.findWhere(table1, { column_name: columnName })
    var col2 = _.findWhere(table2, { column_name: columnName })

    if (col1.data_type !== col2.data_type
      || col1.udt_name !== col2.udt_name
      || col1.character_maximum_length !== col2.character_maximum_length) {
      dbdiff.log('-- Previous data type was %s', dataType(col1))
      dbdiff.log('ALTER TABLE \"%s\" ALTER COLUMN "%s" SET DATA TYPE %s;', tableName, columnName, dataType(col2))
    }
    if (col1.is_nullable !== col2.is_nullable) {
      if (col2.is_nullable === 'YES') {
        dbdiff.log('ALTER TABLE \"%s\" ALTER COLUMN "%s" DROP NOT NULL;', tableName, columnName)
      } else {
        dbdiff.log('ALTER TABLE \"%s\" ALTER COLUMN "%s" SET NOT NULL;', tableName, columnName)
      }
    }
  })
  compareTriggers(db1.tables[tableName], db2.tables[tableName])
}

function indexNames(tableName, indexes) {
  return _.filter(indexes, function (index) {
    return index.tablename === tableName
  }).map(function (index) {
    return index.indname
  }).sort()
}

function compareIndexes(tableName, db1, db2) {
  var indexes1 = db1.indexes
  var indexes2 = db2.indexes
  var indexNames1 = indexNames(tableName, indexes1)
  var indexNames2 = indexNames(tableName, indexes2)
  var diff1 = _.difference(indexNames1, indexNames2)
  var diff2 = _.difference(indexNames2, indexNames1)

  if (diff1.length > 0) {
    diff1.forEach(function (indexName) {
      var index = _.findWhere(indexes1, { indname: indexName })
      dbdiff.log('DROP INDEX IF EXISTS "%s"."%s";', index.nspname, indexName)
    })
  }
  if (diff2.length > 0) {
    diff2.forEach(function (indexName) {
      var index = _.findWhere(indexes2, { indname: indexName })
      if (index && index.tablename) {
        dbdiff.log('CREATE INDEX IF NOT EXISTS "%s" ON "%s" USING %s (%s);', indexName, index.tablename, index.indam, index.indkey_names.join(','))
      }
    })
  }

  var inter = _.intersection(indexNames1, indexNames2)
  inter.forEach(function (indexName) {
    var index1 = _.findWhere(indexes1, { indname: indexName })
    var index2 = _.findWhere(indexes2, { indname: indexName })

    if (_.difference(index1.indkey_names, index2.indkey_names).length > 0) {
      var index = index2
      dbdiff.log('-- Index "%s"."%s" needs to be changed', index.nspname, index.indname)
      dbdiff.log('DROP INDEX IF EXISTS "%s"."%s";', index.nspname, index.indname)
      dbdiff.log('CREATE INDEX IF NOT EXISTS "%s" ON "%s" USING %s (%s);', index.indname, index.tablename, index.indam, index.indkey_names.join(','))
    }
  })
}

function isNumber(n) {
  return +n == n
}

function sequenceDescription(sequence) {
  return util.format('CREATE SEQUENCE IF NOT EXISTS "%s" INCREMENT %s %s %s %s %s CYCLE;',
    sequence.name,
    sequence.increment,
    isNumber(sequence.minimum_value) ? 'MINVALUE ' + sequence.minimum_value : 'NO MINVALUE',
    isNumber(sequence.maximum_value) ? 'MAXVALUE ' + sequence.maximum_value : 'NO MAXVALUE',
    isNumber(sequence.start_value) ? 'START ' + sequence.start_value : '',
    sequence.cycle_option === 'NO' ? 'NO' : ''
  )
}

function sequenceNames(db) {
  return db.sequences.map(function (sequence) {
    return sequence.name
  }).sort()
}

function compareSequences(db1, db2) {
  var sequenceNames1 = sequenceNames(db1)
  var sequenceNames2 = sequenceNames(db2)

  var diff1 = _.difference(sequenceNames1, sequenceNames2)
  var diff2 = _.difference(sequenceNames2, sequenceNames1)

  diff1.forEach(function (sequenceName) {
    dbdiff.log('DROP SEQUENCE IF EXISTS "%s"."%s";', db2.schema, sequenceName)
  })

  diff2.forEach(function (sequenceName) {
    var sequence = _.findWhere(db2.sequences, { name: sequenceName })
    dbdiff.log(sequenceDescription(sequence))
  })

  var inter = _.intersection(sequenceNames1, sequenceNames2)
  inter.forEach(function (sequenceName) {
    var sequence1 = _.findWhere(db1.sequences, { name: sequenceName })
    var sequence2 = _.findWhere(db2.sequences, { name: sequenceName })

    var desc1 = sequenceDescription(sequence1)
    var desc2 = sequenceDescription(sequence2)

    if (desc2 !== desc1) {
      dbdiff.log('DROP SEQUENCE IF EXISTS "%s"."%s";', db2.schema, sequenceName)
      dbdiff.log(desc2)
    }
  })
}

function constraintDescription(constraint) {
  return util.format(
    `ALTER TABLE "public"."%s" DROP CONSTRAINT IF EXISTS \"%s\" CASCADE;
    DROP INDEX IF EXISTS "%s";
    ALTER TABLE \"public\".\"%s\" ADD CONSTRAINT \"%s\" %s;`,
    constraint.table_name,
    constraint.constraint_name,
    constraint.constraint_name,
    constraint.table_name,
    constraint.constraint_name,
    constraint.definition
  );
  /*  
    return util.format('CREATE SEQUENCE %s INCREMENT %s %s %s %s %s CYCLE;',
        sequence.name,
        sequence.increment,
        isNumber(sequence.minimum_value) ? 'MINVALUE '+sequence.minimum_value : 'NO MINVALUE',
        isNumber(sequence.maximum_value) ? 'MAXVALUE '+sequence.maximum_value : 'NO MAXVALUE',
        isNumber(sequence.start_value) ? 'START '+sequence.start_value : '',
        sequence.cycle_option === 'NO' ? 'NO' : ''
      )
  */
}
function constraintNames(db) {
  return db.constraints
    .map(function (constraint) {
      // console.log(constraint.constraint_name, constraint.constraint_type)
      return {
        constraint_name: constraint.constraint_name,
        table_name: constraint.table_name,
        definition: constraint.definition
      }
    }).sort();
}


function compareConstraints(db1, db2) {
  var constraints1 = constraintNames(db1)
  var constraints2 = constraintNames(db2)

  var names1 = constraints1.map(c => c.constraint_name)
  var names2 = constraints2.map(c => c.constraint_name)

  var onlyInDb1Names = _.difference(names1, names2)
  var onlyInDb2Names = _.difference(names2, names1)
  var inBothNames = _.intersection(names1, names2)

  var onlyInDb1 = constraints1.filter(c => onlyInDb1Names.includes(c.constraint_name))
  var onlyInDb2 = constraints2.filter(c => onlyInDb2Names.includes(c.constraint_name))
  var inBoth = constraints1.filter(c => inBothNames.includes(c.constraint_name))

  onlyInDb1.forEach(function (c) {

    dbdiff.log(`ALTER TABLE "public"."%s" DROP CONSTRAINT IF EXISTS \"%s\" CASCADE;
      DROP INDEX IF EXISTS "%s";`,
      c.table_name,
      c.constraint_name,
      c.constraint_name)
  })
  onlyInDb2.forEach(function (c) {
    dbdiff.log(constraintDescription(c))
  })

  inBoth.forEach(function (c1) {
    var c2 = _.findWhere(db2.constraints, { constraint_name: c1.constraint_name })

    var desc1 = constraintDescription(c1)
    var desc2 = constraintDescription(c2)

    if (desc2 !== desc1) {
      dbdiff.log(desc2)
    }
  })
}
function compareTriggers(table1, table2) {
  var triggers1 = table1.triggers;
  var triggers2 = table2.triggers;
  // console.log(triggers1, triggers2)
  // console.log("triggers1", triggers1);
  // console.log("triggers2", triggers2);
  if (triggers1.length === 0 && triggers2.length === 0) return;
  var names1 = triggers1.map(t => t?.trigger_name)
  var names2 = triggers2.map(t => t?.trigger_name)

  var onlyInDb1Names = _.difference(names1, names2)
  var onlyInDb2Names = _.difference(names2, names1)
  var inBothNames = _.intersection(names1, names2)

  var onlyInDb1 = triggers1.filter(t => onlyInDb1Names.includes(t.trigger_name))
  var onlyInDb2 = triggers2.filter(t => onlyInDb2Names.includes(t.trigger_name))
  var inBoth = triggers1.filter(t => inBothNames.includes(t.trigger_name))
  onlyInDb1.forEach(function (t) {
    dbdiff.log('DROP TRIGGER IF EXISTS \"%s\" ON \"%s\";',
      t.trigger_name,
      t.event_object_table)
  })

  onlyInDb2.forEach(function (t) {
    dbdiff.log(ddlTrigger(t))
  })

  inBoth.forEach(function (t1) {
    var t2 = _.findWhere(table2.triggers, { trigger_name: t1.trigger_name })

    var desc1 = ddlTrigger(t1)
    var desc2 = ddlTrigger(t2)

    if (desc2 !== desc1) {
      // var trigger = t2
      // dbdiff.log('DROP TRIGGER IF EXISTS \%s\" ON \"$s\"',
      //   trigger.trigger_name,
      //   trigger.event_object_table)
      dbdiff.log(desc2)
    }
  })
  return;
}
dbdiff.compareSchemas = function (db1, db2) {
  var tableNames1 = _.keys(db1.tables).sort()
  var tableNames2 = _.keys(db2.tables).sort()
  var diff1 = _.difference(tableNames1, tableNames2)
  var diff2 = _.difference(tableNames2, tableNames1)

  var foreignKeyConstraints = [];

  diff1.forEach(function (tableName) {
    dbdiff.log('DROP TABLE IF EXISTS "%s"."%s" CASCADE;', db2.schema, tableName)
    compareTriggers(db1.tables[tableName], { triggers: [] })
  })

  diff2.forEach(function (tableName) {
    var columns = db2.tables[tableName].columns.map(function (col) {
      var type = dataType(col)
      return '\n  "' + col.column_name + '" ' + columnDescription(col)
    })
    var tableConstraints = db2.constraints.filter(function (c) {
      return c.table_name === tableName;
    });
    var nonFkConstraints = tableConstraints.filter(function (c) {
      return !/^FOREIGN KEY/i.test(c.definition.trim());
    });
    var fkConstraints = tableConstraints.filter(function (c) {
      return /^FOREIGN KEY/i.test(c.definition.trim());
    });
    foreignKeyConstraints = foreignKeyConstraints.concat(fkConstraints);
    var constraintDefs = nonFkConstraints.map(function (c) {
      return '\n  CONSTRAINT "' + c.constraint_name + '" ' + c.definition;
    });
    var allDefs = columns.concat(constraintDefs);
    dbdiff.log('CREATE TABLE IF NOT EXISTS "%s"."%s" (%s);', db2.schema, tableName, allDefs.join(','))

    var indexNames2 = indexNames(tableName, db2.indexes)
    indexNames2.forEach(function (indexName) {
      var index = _.findWhere(db2.indexes, { indname: indexName })
      dbdiff.log('CREATE INDEX IF NOT EXISTS "%s" ON "%s" USING %s (%s);', index.indname, index.tablename, index.indam, index.indkey_names.join(','))
    })
    compareTriggers({ triggers: [] }, db2.tables[tableName]);
  })

  var inter = _.intersection(tableNames1, tableNames2)
  inter.forEach(function (tableName) {
    compareTables(tableName, db1, db2)
    compareIndexes(tableName, db1, db2)
  })
  compareSequences(db1, db2)
  compareConstraints(
    {
      ...db1,
      constraints: db1.constraints.filter(c => inter.includes(c.table_name))

    },
    {
      ...db2,
      constraints: db2.constraints.filter(c => inter.includes(c.table_name))
    }
  )
  foreignKeyConstraints.forEach(function (c) {
    dbdiff.log('ALTER TABLE "%s"."%s" ADD CONSTRAINT %s %s;', db2.schema, c.table_name, c.constraint_name, c.definition)
  })
}
dbdiff.compareDatabases = async function (comparison, callback) {
  const { current: currentDatabase, target: targetDatabase } = comparison;

  try {
    const [dbout1, dbout2] = await Promise.all([
      dbdiff.describeDatabase(currentDatabase.conn, currentDatabase.schema),
      dbdiff.describeDatabase(targetDatabase.conn, targetDatabase.schema)
    ]);
    dbout1.schema = currentDatabase.schema;
    dbout2.schema = targetDatabase.schema;

    const diff = dbdiff.compareSchemas(dbout1, dbout2);
    // callback(null, diff);

    return diff;
  } catch (err) {
    // callback(err);
    console.error(err.message)
  }
};
// dbdiff.compareDatabases = function (comparison, callback) {
//   var currentDatabase = comparison.current
//   var targetDatabase = comparison.target
//   var dbout1, dbout2
//   txain(function (callback) {
//     dbdiff.describeDatabase(currentDatabase.conn, currentDatabase.schema, callback)
//   })
//     .then(function (dbout, callback) {
//       dbout1 = dbout
//       dbout1.schema = currentDatabase.schema
//       dbdiff.describeDatabase(targetDatabase.conn, targetDatabase.schema, callback)
//     })
//     // .then(function (dbout, callback) {
//     //   dbout2 = dbout
//     //   dbout2.schema = targetDatabase.schema
//     //   dbdiff.compareSchemas(dbout1, dbout2)
//     //   callback()
//     // })
//     .end(callback)
// }

if (require.main && module.id === require.main.id) {
  var yargs = require('yargs')
  var argv = yargs
    .usage('Usage: $0 conn_string1 schema1 conn_string2 schema2')
    .example('$0 postgres://user:pass@host[:port]/dbname1 schema1 postgres://user:pass@host[:port]/dbname2 schema2',
      'compares a single postgres schema against another schema and prints the SQL commands to modify the first one in order to match the second one')
    .demand(4)
    .wrap(yargs.terminalWidth())
    .help('h')
    .alias('h', 'help')
    .argv

  var conn1 = argv._[0]
  var schema1 = argv._[1]
  var conn2 = argv._[2]
  var schema2 = argv._[3]
  dbdiff.logger = function (msg) {
    console.log(msg)
  }
  dbdiff.compareDatabases({ current: { conn: conn1, schema: schema1 }, target: { conn: conn2, schema: schema2 } }, function (err) {
    if (err) {
      console.error(String(err))
      process.exit(1)
    }
  })
}