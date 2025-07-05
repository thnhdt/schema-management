const { POOLMAP } = require('./database.service');
const { BadResponseError } = require('../cores/error.response');
const { ddl } = require('../utils/helper.utils');
const { QueryTypes } = require('sequelize');
const databaseService = require('../services/database.service');

const test = async (reqBody) => {
  const { id } = reqBody;
  const sequelizeDatatabase = await databaseService.connectToDatabase({ id });
  // const [rows] = await POOLMAP.get(id).sequelize.query(
  const [rows] = await sequelizeDatatabase.query(
    `SELECT * from users;`
  );
  await sequelizeDatatabase.close();
  return {
    code: 200,
    metaData: {
      data: rows
    }
  }
}
// get schema cho từng table
const createSchema = async (reqBody) => {
  const { schema, tableName, id } = reqBody;
  // if (!POOLMAP.has(id)) throw new BadResponseError("Chưa kết nối với database!");
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
  // const client = POOLMAP.get(id).sequelize;
  // if (!client) throw new BadResponseError("Chưa kết nối với database!");
  const client = await databaseService.connectToDatabase({ id });
  // kết quả sẽ là {table_name, columns}
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
  const allSqlSchema = await Promise.all(allTables.map(async table => ({ ...table, text: await ddl("public", table.table_name, client) })));
  // const allSqlSchema = await Promise.all(allTables.map(async table => ({ tableName: table, columns: await getCountColumns({ schema: 'public', tableName: table, id }) })));
  await client.close();
  return {
    code: 200,
    metaData: {
      data: allSqlSchema
    }
  }
};

const getAllDdlText = async (reqBody) => {
  const { schema, id } = reqBody;
  // const client = POOLMAP.get(id).sequelize;
  // if (!client) throw new BadResponseError("Chưa kết nối đến database !");
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
  const allSqlSchema = await Promise.all(allTables.map(table => ddl("public", table.tableName, client)));
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
  // const client = POOLMAP.get(id).sequelize;
  // if (!client) throw new BadResponseError("Chưa kết nối đến database !");
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
  // if (!POOLMAP.has(id)) throw new BadResponseError('Chưa kết nối với database!');
  // const sequelize = POOLMAP.get(id).sequelize;
  const sequelize = await databaseService.connectToDatabase({ id });
  // Sử dụng schema nếu có
  const fullTableName = schema ? `"${schema}"."${tableName}"` : `"${tableName}"`;
  await sequelize.query(`ALTER TABLE ${fullTableName} DROP COLUMN "${columnName}";`);
  await sequelize.close();
  return { code: 200, metaData: { message: `Đã xóa cột ${columnName} khỏi bảng ${tableName}` } };
};

const deleteRow = async ({ id, tableName, schema = 'public', where }) => {
  // if (!POOLMAP.has(id)) throw new BadResponseError('Chưa kết nối với database!');
  // const sequelize = POOLMAP.get(id).sequelize;
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
  // if (!POOLMAP.has(id)) throw new BadResponseError('Chưa kết nối với database!');
  // const sequelize = POOLMAP.get(id).sequelize;
  const sequelize = await databaseService.connectToDatabase({ id });
  const fullTableName = schema ? `"${schema}"."${tableName}"` : `"${tableName}"`;
  await sequelize.query(`DROP TABLE IF EXISTS ${fullTableName} CASCADE;`);
  await sequelize.close();
  return { code: 200, metaData: { message: `Đã xóa bảng ${tableName}` } };
};

const getColumns = async ({ id, tableName, schema = 'public' }) => {
  // if (!POOLMAP.has(id)) throw new BadResponseError('Chưa kết nối với database!');
  // const sequelize = POOLMAP.get(id).sequelize;
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

// {
//   "id": "<databaseId>",
//   "tableName": "<tên_bảng>",
//   "columnName": "<tên_cột>",
//   "schema": "public" // (tùy chọn, mặc định là public)
// }

module.exports = {
  test,
  createSchema,
  getAllTables,
  getAllDdlText,
  getCountColumns,
  dropColumn,
  deleteRow,
  dropTable,
  getColumns
}