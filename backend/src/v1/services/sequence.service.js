const { BadResponseError } = require('../cores/error.response');
const { QueryTypes } = require('sequelize');
const databaseService = require('../services/database.service');
const { sequenceDescription } = require('../utils/helper.utils');
const getAllSequences = async (reqBody) => {
  const { schema, id } = reqBody;
  const sequelizeDatabase = await databaseService.connectToDatabase({ id });
  const allSequence = await sequelizeDatabase.query(
    `SELECT 
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
      WHERE sequence_schema = :schema;`,
    {
      replacements: { schema },
      type: QueryTypes.SELECT
    }
  );
  const result = await allSequence.map(sequence => ({ ...sequence, ddl: sequenceDescription(sequence) }));
  await sequelizeDatabase.close();
  return {
    code: 200,
    metaData: {
      data: result
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