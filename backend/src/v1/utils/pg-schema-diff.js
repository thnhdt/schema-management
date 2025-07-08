#!/usr/bin/env node

var txain = require('txain')
var multiline = require('multiline')
var _ = require('underscore')
var pg = require('pg')
var util = require('util')

var dbdiff = module.exports = {}

dbdiff.log = function () {
  var msg = util.format.apply(null, Array.prototype.slice.call(arguments))
  dbdiff.logger(msg)
}

dbdiff.describeDatabase = function (conString, schemaname, callback) {
  var client = new pg.Client(conString)
  var schema = { tables: {} }

  txain(function (callback) {
    client.connect(callback)
  })
    .then(function (client, done, callback) {
      //console.log('connected')
      client.query('SELECT * FROM pg_tables WHERE schemaname = $1', [schemaname], callback)
    })
    .then(function (result, callback) {
      //console.log('got tables', result)
      callback(null, result.rows)
    })
    .map(function (table, callback) {
      //console.log('map table', table)
      var query = multiline(function () {
        ;/*
      SELECT
        table_name,
        column_name,
        data_type,
        udt_name,
        character_maximum_length,
        is_nullable,
        '' as column_default
      FROM
        INFORMATION_SCHEMA.COLUMNS
      WHERE
        table_name=$1 AND table_schema=$2;
    */})
      client.query(query, [table.tablename, schemaname], callback)
    })
    .then(function (descriptions, callback) {
      //console.log('got descriptions', descriptions)
      var tables = schema.tables = {}
      descriptions.forEach(function (desc) {
        desc.rows.forEach(function (row) {
          var tableName = row.table_name
          var table = tables[tableName]
          if (!table) {
            tables[tableName] = []
            table = tables[tableName]
          }
          delete row.table_name
          table.push(row)
        })
      })

      var query = multiline(function () {
        ;/*
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
        ns.nspname
      FROM
        pg_index as idx
      JOIN pg_class as i
        ON i.oid = idx.indexrelid
      JOIN pg_am as am
        ON i.relam = am.oid
      JOIN pg_namespace as ns
        ON ns.oid = i.relnamespace
        AND ns.nspname NOT IN ('pg_catalog', 'pg_toast')
      WHERE ns.nspname = $1;
    */})
      client.query(query, [schemaname], callback)
    })
    .then(function (indexes, callback) {
      //console.log('got indexes', result)
      schema.indexes = indexes.rows

      var query = multiline(function () {
        ;/*
      SELECT
        con.conname                         AS constraint_name,
        n.nspname                           AS schema_name,
        rel.relname                         AS table_name,
        con.contype                         AS constraint_type,
        pg_get_constraintdef(con.oid)       AS definition
      FROM pg_constraint con
      JOIN pg_class rel       ON rel.oid = con.conrelid
      JOIN pg_namespace n     ON n.oid   = rel.relnamespace
      WHERE n.nspname = $1;
    */})
      client.query(query, [schemaname], callback)
    })
    .then(function (constraints, callback) {
      //console.log('got constraints', result)
      schema.constraints = constraints.rows
      var query = multiline(function () {
        ;/*
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
      FROM 
        information_schema.sequences
      WHERE sequence_schema = $1;
    */})
      client.query(query, [schemaname], callback)
    }).then(function (result, callback) {
      //console.log('got sequences', result)
      schema.sequences = result.rows
      schema.sequences.forEach(function (sequence) {
        sequence.name = sequence.sequence_name
      })
      client.query('SELECT current_schema()', callback)
    })
    .end(function (err, result) {
      //console.log('reached the end', result)
      client.end()
      if (err) return callback(err)
      callback(null, schema)
    })
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
  var table1 = db1.tables[tableName]
  var table2 = db2.tables[tableName]

  var columNames1 = columnNames(table1)
  var columNames2 = columnNames(table2)

  var diff1 = _.difference(columNames1, columNames2)
  var diff2 = _.difference(columNames2, columNames1)

  diff1.forEach(function (columnName) {
    dbdiff.log('ALTER TABLE %s DROP COLUMN "%s";', tableName, columnName)
  })

  diff2.forEach(function (columnName) {
    var col = _.findWhere(table2, { column_name: columnName })
    var type = dataType(col)
    dbdiff.log('ALTER TABLE %s ADD COLUMN "%s" %s;', tableName, columnName, columnDescription(col))
  })

  var common = _.intersection(columNames1, columNames2)
  common.forEach(function (columnName) {
    var col1 = _.findWhere(table1, { column_name: columnName })
    var col2 = _.findWhere(table2, { column_name: columnName })

    if (col1.data_type !== col2.data_type
      || col1.udt_name !== col2.udt_name
      || col1.character_maximum_length !== col2.character_maximum_length) {
      dbdiff.log('-- Previous data type was %s', dataType(col1))
      dbdiff.log('ALTER TABLE %s ALTER COLUMN "%s" SET DATA TYPE %s;', tableName, columnName, dataType(col2))
    }
    if (col1.is_nullable !== col2.is_nullable) {
      if (col2.is_nullable === 'YES') {
        dbdiff.log('ALTER TABLE %s ALTER COLUMN "%s" DROP NOT NULL;', tableName, columnName)
      } else {
        dbdiff.log('ALTER TABLE %s ALTER COLUMN "%s" SET NOT NULL;', tableName, columnName)
      }
    }
  })
}

function indexNames(tableName, indexes) {
  return _.filter(indexes, function (index) {
    return util.format('"%s"."%s"', index.nspname, index.indrelid) === tableName
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
      dbdiff.log('DROP INDEX "%s"."%s";', index.nspname, indexName)
    })
  }
  if (diff2.length > 0) {
    diff2.forEach(function (indexName) {
      var index = _.findWhere(indexes2, { indname: indexName })
      dbdiff.log('CREATE INDEX "%s" ON %s USING %s (%s);', indexName, index.indrelid, index.indam, index.indkey_names.join(','))
    })
  }

  var inter = _.intersection(indexNames1, indexNames2)
  inter.forEach(function (indexName) {
    var index1 = _.findWhere(indexes1, { indname: indexName })
    var index2 = _.findWhere(indexes2, { indname: indexName })

    if (_.difference(index1.indkey_names, index2.indkey_names).length > 0) {
      var index = index2
      dbdiff.log('-- Index "%s"."%s" needs to be changed', index.nspname, index.indname)
      dbdiff.log('DROP INDEX "%s"."%s";', index.nspname, index.indname)
      dbdiff.log('CREATE INDEX "%s" ON %s USING %s (%s);', index.indname, index.indrelid, index.indam, index.indkey_names.join(','))
    }
  })
}

function isNumber(n) {
  return +n == n
}

function sequenceDescription(sequence) {
  return util.format('CREATE SEQUENCE %s INCREMENT %s %s %s %s %s CYCLE;',
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
    dbdiff.log('DROP SEQUENCE %s;', sequenceName)
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
      dbdiff.log('DROP SEQUENCE %s;', sequenceName)
      dbdiff.log(desc2)
    }
  })
}

function constraintDescription(constraint) {
  // console.log("constraint", constraint);
  return util.format(
    'ALTER TABLE \"public\".\"%s\" ADD CONSTRAINT %s %s;',
    constraint.table_name,
    constraint.constraint_name,
    constraint.definition
  );
  // if (constraint.constraint_type === 'FOREIGN KEY') {
  //   return util.format(
  //     'ALTER TABLE public.%s ADD CONSTRAINT %s FOREIGN KEY ("%s") ' +
  //     'REFERENCES public.%s("%s") ON UPDATE %s ON DELETE %s;',
  //     constraint.table_name,
  //     constraint.constraint_name,
  //     constraint.column_name,
  //     constraint.foreign_table_name,
  //     constraint.foreign_column_name,
  //     constraint.on_update,
  //     constraint.on_delete
  //   );
  // }
  // return util.format('-- Need to ADD CONSTRAINT "%s" for Column "%s" on Table "%s"',
  //   constraint.constraint_name,
  //   constraint.column_name,
  //   constraint.table_name);
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

// function constraintNames(db) {
//   return db.constraints.map(function (constraint) {
//     return constraint.constraint_name
//   }).sort()
// }

// function compareConstraints(db1, db2) {
//   var constraintNames1 = constraintNames(db1)
//   var constraintNames2 = constraintNames(db2)

//   var diff1 = _.difference(constraintNames1, constraintNames2)
//   var diff2 = _.difference(constraintNames2, constraintNames1)

//   diff1.forEach(function (constraintName) {
//     dbdiff.log('-- Need to DROP CONSTRAINT "%s" - not in target database', constraintName)
//   })

//   diff2.forEach(function (constraintName) {
//     var constraint = _.findWhere(db2.constraints, { constraint_name: constraintName })
//     dbdiff.log(constraintDescription(constraint))
//   })

//   var inter = _.intersection(constraintNames1, constraintNames2)
//   inter.forEach(function (constraintName) {
//     var constraint1 = _.findWhere(db1.constraints, { constraint_name: constraintName })
//     var constraint2 = _.findWhere(db2.constraints, { constraint_name: constraintName })

//     var desc1 = constraintDescription(constraint1)
//     var desc2 = constraintDescription(constraint2)

//     if (desc2 !== desc1) {
//       dbdiff.log('-- Need to DROP CONSTRAINT "%s" - not in target database', constraintName)
//       dbdiff.log(desc2)
//     }
//   })
// }

function constraintNames(db) {
  return db.constraints.map(function (constraint) {
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
    dbdiff.log('ALTER TABLE "public"."%s" DROP CONSTRAINT %s %s;',
      c.table_name,
      c.constraint_name,
      c.definition)
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

dbdiff.compareSchemas = function (db1, db2) {
  compareSequences(db1, db2)
  compareConstraints(db1, db2)

  var tableNames1 = _.keys(db1.tables).sort()
  var tableNames2 = _.keys(db2.tables).sort()

  var diff1 = _.difference(tableNames1, tableNames2)
  var diff2 = _.difference(tableNames2, tableNames1)

  diff1.forEach(function (tableName) {
    dbdiff.log('DROP TABLE %s.%s;', db2.schema, tableName)
  })

  diff2.forEach(function (tableName) {
    var columns = db2.tables[tableName].map(function (col) {
      var type = dataType(col)
      return '\n  "' + col.column_name + '" ' + columnDescription(col)
    })
    dbdiff.log('CREATE TABLE %s.%s (%s);', db2.schema, tableName, columns.join(','))

    var indexNames2 = indexNames(tableName, db2.indexes)
    indexNames2.forEach(function (indexName) {
      var index = _.findWhere(db2.indexes, { indname: indexName })
      dbdiff.log('CREATE INDEX "%s" ON %s USING %s (%s);', index.indname, index.indrelid, index.indam, index.indkey_names.join(','))
    })
  })

  var inter = _.intersection(tableNames1, tableNames2)
  inter.forEach(function (tableName) {
    compareTables(tableName, db1, db2)
    compareIndexes(tableName, db1, db2)
  })
}

dbdiff.compareDatabases = function (comparison, callback) {
  var currentDatabase = comparison.current
  var targetDatabase = comparison.target
  var dbout1, dbout2
  txain(function (callback) {
    dbdiff.describeDatabase(currentDatabase.conn, currentDatabase.schema, callback)
  })
    .then(function (dbout, callback) {
      dbout1 = dbout
      dbout1.schema = currentDatabase.schema
      dbdiff.describeDatabase(targetDatabase.conn, targetDatabase.schema, callback)
    })
    .then(function (dbout, callback) {
      dbout2 = dbout
      dbout2.schema = targetDatabase.schema
      dbdiff.compareSchemas(dbout1, dbout2)
      callback()
    })
    .end(callback)
}

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
