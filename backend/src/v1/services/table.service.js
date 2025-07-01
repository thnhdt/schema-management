const { POOLMAP } = require('./database.service');
const { BadResponseError } = require('../cores/error.response');
const { ddl } = require('../utils/helper.utils');
const { QueryTypes } = require('sequelize');

const test = async (reqBody) => {
  const { id } = reqBody;
  const [rows] = await POOLMAP.get(id).sequelize.query(
    `SELECT * from users;`
  );
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
  if (!POOLMAP.has(id)) throw new BadResponseError("Chưa kết nối với database!");
  const ddlText = await ddl(schema, tableName, POOLMAP.get(id).sequelize);
  return {
    code: 200,
    metaData: {
      text: ddlText
    }
  }
}
const getAllTables = async (reqBody) => {
  const { schema, id } = reqBody;
  const client = POOLMAP.get(id).sequelize;
  if (!client) throw new BadResponseError("Chưa kết nối với database!");

  // kết quả sẽ là {table_name, columns}
  const allTables = await POOLMAP.get(id).sequelize.query(
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
  return {
    code: 200,
    metaData: {
      data: allSqlSchema
    }
  }
};

const getAllDdlText = async (reqBody) => {
  const { schema, id } = reqBody;
  const client = POOLMAP.get(id).sequelize;
  if (!client) throw new BadResponseError("Chưa kết nối đến database !");
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
  return {
    code: 200,
    metaData: {
      data: schemaSql
    }
  }
};
const getCountColumns = async (reqBody) => {
  const { schema, tableName, id } = reqBody;
  const client = POOLMAP.get(id).sequelize;
  if (!client) throw new BadResponseError("Chưa kết nối đến database !");
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
  return countColumns[0];
};
module.exports = {
  test,
  createSchema,
  getAllTables,
  getAllDdlText,
  getCountColumns
}