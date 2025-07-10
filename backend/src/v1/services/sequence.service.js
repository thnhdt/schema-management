const { BadResponseError } = require('../cores/error.response');
const { QueryTypes } = require('sequelize');
const databaseService = require('../services/database.service');

const getAllSequences = async (reqBody) => {
  const { schema, id } = reqBody;
  const sequelizeDatabase = await databaseService.connectToDatabase({ id });
  const allSequence = await sequelizeDatabase.query(
    `SELECT sequence_schema,
       sequence_name,
       data_type,
       start_value,
       increment
FROM   information_schema.sequences
WHERE sequence_schema=:schema
ORDER  BY sequence_schema, sequence_name;`,
    {
      replacements: { schema },
      type: QueryTypes.SELECT
    }
  );
  await sequelizeDatabase.close();
  return {
    code: 200,
    metaData: {
      data: allSequence
    }
  }
}

const dropSequence = async ({ id, sequenceName, schema = 'public' }) => {
  const sequelize = await databaseService.connectToDatabase({ id });
  const fullSequenceName = schema ? `"${schema}"."${sequenceName}"` : `"${sequenceName}"`;
  await sequelize.query(`DROP SEQUENCE IF EXISTS ${fullSequenceName};`);
  await sequelize.close();
  return { code: 200, metaData: { message: `Đã xóa sequence ${sequenceName}` } };
};

module.exports = {
  getAllSequences,
  dropSequence
}