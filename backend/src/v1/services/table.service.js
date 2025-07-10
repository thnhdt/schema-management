const { POOLMAP } = require('./database.service');
const { BadResponseError } = require('../cores/error.response');
const { ddl } = require('../utils/helper.utils');
const { QueryTypes } = require('sequelize');
const databaseService = require('../services/database.service');
const { getAllUpdateOnTableUtil, getAllUpdateBetweenDatabases } = require('../utils/helper.utils');

const mergeTables = (arrTableTarget, arrTableCurrent) => {
  const map = new Map();

  for (const fn of arrTableTarget) {
    const key = `${fn.table_name}`;
    map.set(key, { left: fn, right: null });
  }

  for (const fn of arrTableCurrent) {
    const key = `${fn.table_name}`;
    if (map.has(key)) {
      map.get(key).right = fn;
    }
    else {
      map.set(key, { left: null, right: fn });
    }
  }
  return map;
}

const test = async (reqBody) => {
  const { id } = reqBody;
  const sequelizeDatabase = await databaseService.connectToDatabase({ id });
  const [rows] = await sequelizeDatabase.query(
    `SELECT * from users;`
  );
  return {
    code: 200,
    metaData: {
      data: rows
    }
  }
}

const createSchema = async (reqBody) => {
  const { schema, tableName, id } = reqBody;
  const sequelizeDatatabase = await databaseService.connectToDatabase({ id });
  const ddlText = await ddl(schema, tableName, sequelizeDatatabase);
  await sequelizeDatatabase.close();
  return {
    code: 200,
    metaData: {
      text: ddlText
    }
  }
}

const getAllTables = async (reqBody) => {
  const { schema, id } = reqBody;
  const client = await databaseService.connectToDatabase({ id });
  const allTables = await client.query(
    `SELECT
  table_name,         
  COUNT(column_name) AS columns
  FROM information_schema.columns
  WHERE table_schema NOT IN ('pg_catalog', 'information_schema') AND  table_schema = :schema
  GROUP BY table_name
  ORDER BY table_name;`,
    {
      replacements: { schema },
      type: QueryTypes.SELECT
    }
  );

  const allSqlSchema = await Promise.all(
    allTables.map(async (table) => {
      const text = await ddl("public", table.table_name, client);
      return { ...table, text };
    })
  );
  await client.close();
  return {
    code: 200,
    metaData: {
      data: allSqlSchema
    }
  }
};
const getAllUpdateOnTables = async (reqBody, user) => {
  const { targetDatabaseId, currentDatabaseId } = reqBody;
  if (!user.isAdmin) {
    const permissions = user.userPermissions.some(role => role?.permissions.some(p => p.databaseId.toString() === targetDatabaseId) && role?.permissions.some(p => p.databaseId.toString() === currentDatabaseId));
    if (!permissions) throw new BadResponseError("Bạn không có quyền truy cập một trong hai DB !")
  }
  const [defaultAllTablesInTargetDB, defaultAllTablesInCurrentDB] = await Promise.all([getAllTables({ schema: 'public', id: targetDatabaseId }), getAllTables({ schema: 'public', id: currentDatabaseId })]);
  const allTablesInTargetDB = defaultAllTablesInTargetDB.metaData.data;
  const allTablesInCurrentDB = defaultAllTablesInCurrentDB.metaData.data;
  const mapTables = mergeTables(allTablesInTargetDB, allTablesInCurrentDB);
  const sqlUpdateSchemaTables = await getAllUpdateOnTableUtil(targetDatabaseId, currentDatabaseId, mapTables);
  const allUpdate = Array.from(
    sqlUpdateSchemaTables.mapTables
  ).filter(([key, value]) => value?.stmts != null)
    .map(([key, value]) => ({
      key,
      ...value
    }));
  return {
    code: 200,
    updateSchema: sqlUpdateSchemaTables.updateSchema,
    allUpdate,
    targetDB: sqlUpdateSchemaTables.targetDatabase,
    currentDB: sqlUpdateSchemaTables.currentDatabase,
    sequence: sqlUpdateSchemaTables.sequence,
    index: sqlUpdateSchemaTables.index
  }
}
const getAllDdlText = async (reqBody) => {
  const { schema, id } = reqBody;
  const client = await databaseService.connectToDatabase({ id });
  const allTables = await client.query(
    `SELECT table_name as \"tableName\"
                     FROM information_schema.columns
                     WHERE table_schema NOT IN (\'pg_catalog\', \'information_schema\') AND  table_schema = :schema
                     GROUP BY table_name;`,
    {
      replacements: { schema },
      type: QueryTypes.SELECT
    }
  );

  // const allSqlSchema = [];
  // for (const table of allTables) {
  //   const ddlText = await ddl("public", table.tableName, client);
  //   allSqlSchema.push(ddlText);
  // }
  const allSqlSchema = await Primise.all(allTables.map(table => ddl("public", table.tableName, client)))
  const schemaSql = allSqlSchema.join('\n');
  await client.close();
  return {
    code: 200,
    metaData: {
      data: schemaSql
    }
  }
};
const getCountColumns = async (reqBody) => {
  const { schema, tableName, id } = reqBody;
  const client = await databaseService.connectToDatabase({ id });
  const countColumns = await client.query(
    `SELECT
                    count(column_name) as totalColumns
                     FROM information_schema.columns
                     WHERE  table_schema NOT IN ('pg_catalog', 'information_schema')
                     and table_schema=:schema
                     and table_name= :tableName;`,
    {
      replacements: { schema, tableName },
      type: QueryTypes.SELECT
    }
  );
  await client.close();
  return countColumns[0];
};

const dropColumn = async ({ id, tableName, columnName, schema = 'public' }) => {
  const sequelize = await databaseService.connectToDatabase({ id });
  const fullTableName = schema ? `"${schema}"."${tableName}"` : `"${tableName}"`;
  await sequelize.query(`ALTER TABLE ${fullTableName} DROP COLUMN "${columnName}";`);
  await sequelize.close();
  return { code: 200, metaData: { message: `Đã xóa cột ${columnName} khỏi bảng ${tableName}` } };
};

const deleteRow = async ({ id, tableName, schema = 'public', where }) => {
  const sequelize = await databaseService.connectToDatabase({ id });
  const fullTableName = schema ? `"${schema}"."${tableName}"` : `"${tableName}"`;
  const keys = Object.keys(where);
  if (keys.length === 0) throw new BadResponseError('Thiếu điều kiện xóa!');
  const conditions = keys.map(key => `"${key}" = :${key}`).join(' AND ');
  await sequelize.query(
    `DELETE FROM ${fullTableName} WHERE ${conditions};`,
    { replacements: where }
  );
  await sequelize.close();
  return { code: 200, metaData: { message: `Đã xóa hàng trong bảng ${tableName}` } };
};

const dropTable = async ({ id, tableName, schema = 'public' }) => {
  const sequelize = await databaseService.connectToDatabase({ id });
  const fullTableName = schema ? `"${schema}"."${tableName}"` : `"${tableName}"`;
  await sequelize.query(`DROP TABLE IF EXISTS ${fullTableName} CASCADE;`);
  await sequelize.close();
  return { code: 200, metaData: { message: `Đã xóa bảng ${tableName}` } };
};

const getColumns = async ({ id, tableName, schema = 'public' }) => {
  const sequelize = await databaseService.connectToDatabase({ id });
  const columns = await sequelize.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = :schema AND table_name = :tableName;`,
    {
      replacements: { schema, tableName },
      type: QueryTypes.SELECT
    }
  );
  await sequelize.close();
  return { code: 200, metaData: { columns: columns.map(col => col.column_name) } };
};
const exportAllUpdateOnTables = async () => {

  const { targetDatabaseId, currentDatabaseId } = reqBody;
  if (!user.isAdmin) {
    const permissions = user.userPermissions.some(role => role?.permissions.some(p => p.databaseId.toString() === targetDatabaseId) && role?.permissions.some(p => p.databaseId.toString() === currentDatabaseId));
    if (!permissions) throw new BadResponseError("Bạn không có quyền truy cập một trong hai DB !")
  }
  const [targetDatabaseUrl, currentDatabaseUrl] = await Promise.all(getStringUrl(targetDatabaseId), getStringUrl(currentDatabaseId));
  const allUpdate = await getAllUpdateBetweenDatabases(targetDatabaseUrl.stringConnectPGUrl, currentDatabaseUrl.stringConnectPGUrl);
  const result = allUpdate.join('\n');
  return {
    code: 200,
    allUpdateSchema: result
  }
}

module.exports = {
  test,
  createSchema,
  getAllTables,
  getAllDdlText,
  getCountColumns,
  dropColumn,
  deleteRow,
  dropTable,
  getColumns,
  getAllUpdateOnTables,
  exportAllUpdateOnTables
}