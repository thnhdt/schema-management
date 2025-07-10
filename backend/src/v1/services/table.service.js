const { POOLMAP } = require('./database.service');
const { BadResponseError } = require('../cores/error.response');
const { ddl } = require('../utils/helper.utils');
const { QueryTypes } = require('sequelize');
const databaseService = require('../services/database.service');
const { getAllUpdateOnTableUtil, getAllUpdateBetweenDatabases, getStringUrl } = require('../utils/helper.utils');
const HistoryModel = require('../models/history.model');
const databaseModel = require('../models/database.model');
const functionService = require('./function-sql.service');

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
  const allSqlSchema = await Promise.all(allTables.map(table => ddl("public", table.tableName, client)))
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
const getAllUpdateDdl = async (reqBody, user) => {
  const { targetDatabaseId, currentDatabaseId } = reqBody;
  if (!user.isAdmin) {
    const permissions = user.userPermissions.some(role => role?.permissions.some(p => p.databaseId.toString() === targetDatabaseId) && role?.permissions.some(p => p.databaseId.toString() === currentDatabaseId));
    if (!permissions) throw new BadResponseError("Bạn không có quyền truy cập một trong hai DB !")
  }
  const [targetDatabaseUrl, currentDatabaseUrl] = await Promise.all([getStringUrl(targetDatabaseId), getStringUrl(currentDatabaseId)]);
  const allUpdate = await getAllUpdateBetweenDatabases(targetDatabaseUrl.stringConnectPGUrl, currentDatabaseUrl.stringConnectPGUrl);
  const result = allUpdate.join('\n');
  return {
    code: 200,
    allUpdateSchema: result
  }
}

const saveDBHistory = async (databaseId) => {
  const currentDatabase = await databaseModel.findById(databaseId).lean();
  if (!currentDatabase) {
    throw new BadResponseError("Database không tồn tại!");
  }
  const [allTablesResponse, allFunctionsResponse] = await Promise.all([
    getAllTables({ schema: 'public', id: databaseId }),
    functionService.getAllFunctions({ schema: 'public', id: databaseId })
  ]);
  const allTablesDdl = allTablesResponse.metaData.data.map(table => table.text).join('\n');
  const allFunctionsDdl = allFunctionsResponse.metaData.data.map(func => func.definition).join('\n');
  const currentHistoryData = {
    databaseName: databaseId,
    versions: [{
      timestamps: new Date(),
      tables: [allTablesDdl],
      functions: [allFunctionsDdl]
    }]
  };
  let currentHistory = await HistoryModel.findOne({ databaseName: databaseId });
  if (currentHistory) {
    currentHistory.versions.push(currentHistoryData.versions[0]);
    await currentHistory.save();
  } else {
    await HistoryModel.create(currentHistoryData);
  }
  return {
    code: 200,
    metaData: {
      message: "Đã lưu lịch sử DDL thành công",
      database: currentDatabase.name
    }
  };
};

const syncDatabase = async (reqBody, user) => {
  const { targetDatabaseId, currentDatabaseId, allUpdateFunction, allUpdateDdlTable } = reqBody;
  
  if (!user.isAdmin) {
    const permissions = user.userPermissions.some(role => 
      role?.permissions.some(p => p.databaseId.toString() === targetDatabaseId) && 
      role?.permissions.some(p => p.databaseId.toString() === currentDatabaseId)
    );
    if (!permissions) throw new BadResponseError("Bạn không có quyền truy cập một trong hai DB !");
  }

  const [currentDatabase, targetDatabase] = await Promise.all([
    databaseModel.findById(currentDatabaseId).lean(),
    databaseModel.findById(targetDatabaseId).lean()
  ]);
  
  if (!currentDatabase || !targetDatabase) {
    throw new BadResponseError("Một trong hai database không tồn tại !");
  }

  const sequelize = await databaseService.connectToDatabase({ id: currentDatabaseId });
  const ddlErrors = [];
  let transaction;
  try {
    // Bắt đầu transaction
    transaction = await sequelize.transaction();
    if (allUpdateFunction && allUpdateFunction.trim()) {
      try {
        await sequelize.query(allUpdateFunction, { transaction });
      } catch (err) {
        await transaction.rollback();
        throw new BadResponseError(`Lỗi khi thực thi function/procedure: ${err.message}`);
      }
    }
    // 2. Thực thi DDL table/index/sequence/constraint: Tách theo dấu chấm phẩy, chỉ thực thi lệnh hợp lệ
    if (allUpdateDdlTable && allUpdateDdlTable.trim()) {
      const tableQueries = allUpdateDdlTable
        .split(';')
        .map(q => q.trim())
        .filter(q => q && /^(CREATE|ALTER|DROP|TRUNCATE|COMMENT|RENAME)/i.test(q));
      for (const query of tableQueries) {
        try {
          console.log('Đang thực thi DDL:', query);
          await sequelize.query(query, { transaction });
        } catch (err) {
          console.error('Lỗi khi thực thi lệnh DDL:', query, err.message);
          ddlErrors.push({ query, error: err.message });
          // KHÔNG throw, KHÔNG rollback, tiếp tục với lệnh tiếp theo
        }
      }
    }
    // Commit transaction (dù có lệnh DDL lỗi, các lệnh thành công vẫn được commit)
    await transaction.commit();
    await saveDBHistory(currentDatabaseId);
    let targetHistory = await HistoryModel.findOne({ databaseName: targetDatabaseId });
    if (targetHistory && targetHistory.versions.length > 0) {
      const latestVersion = targetHistory.versions[targetHistory.versions.length - 1];
      latestVersion.timestamps = new Date();
      await targetHistory.save();
    } else {
      const targetSequelize = await databaseService.connectToDatabase({ id: targetDatabaseId });
      try {
        const [targetAllTablesResponse, targetAllFunctionsResponse] = await Promise.all([
          getAllTables({ schema: 'public', id: targetDatabaseId }),
          functionService.getAllFunctions({ schema: 'public', id: targetDatabaseId })
        ]);
        const targetAllTablesDdl = targetAllTablesResponse.metaData.data.map(table => table.text).join('\n');
        const targetAllFunctionsDdl = targetAllFunctionsResponse.metaData.data.map(func => func.definition).join('\n');
        const targetHistoryData = {
          databaseName: targetDatabaseId,
          versions: [{
            timestamps: new Date(),
            tables: [targetAllTablesDdl],
            functions: [targetAllFunctionsDdl]
          }]
        };
        await HistoryModel.create(targetHistoryData);
      } finally {
        await targetSequelize.close();
      }
    }
    await sequelize.close();
    return {
      code: 200,
      metaData: {
        message: "Cập nhật thành công và đã lưu lịch sử",
        currentDatabase: currentDatabase.name,
        targetDatabase: targetDatabase.name,
        ddlErrors // trả về các lệnh lỗi nếu có
      }
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật database:", error);
    throw new BadResponseError(`Lỗi khi cập nhật database: ${error.message}`);
  } finally {
    if (transaction) await transaction.finished ? null : transaction.rollback();
    await sequelize.close();
  }
};

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
  getAllUpdateDdl,
  syncDatabase,
  saveDBHistory
}