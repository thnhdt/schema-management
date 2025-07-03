const { POOLMAP } = require('./database.service');
const { BadResponseError } = require('../cores/error.response');
const { ddl } = require('../utils/helper.utils');
const { QueryTypes } = require('sequelize');
const getAllFunctions = async (reqBody) => {
  const { schema, id } = reqBody;
  if (!POOLMAP.has(id)) throw new BadResponseError("Chưa kết nối với database!");
  const allFunction = await POOLMAP.get(id).sequelize.query(
    `select n.nspname                        as "functionSchema",
                            p.proname                        as "functionName",
                            case
                                when l.lanname = 'internal' then p.prosrc
                                else pg_get_functiondef(p.oid)
                                end                          as "definition",
                            pg_get_function_arguments(p.oid) as "functionArguments"
                     from pg_proc p
                              left join pg_namespace n on p.pronamespace = n.oid
                              left join pg_language l on p.prolang = l.oid
                              left join pg_type t on t.oid = p.prorettype
                     where n.nspname = :schema
                     order by "functionSchema",
                              "functionName";`,
    {
      replacements: { schema },
      type: QueryTypes.SELECT
    }
  );
  return {
    code: 200,
    metaData: {
      data: allFunction
    }
  }
};

const dropFunction = async ({ id, functionName, args = '', schema = 'public' }) => {
  if (!POOLMAP.has(id)) throw new BadResponseError('Chưa kết nối với database!');
  const sequelize = POOLMAP.get(id).sequelize;
  const fullFunctionName = schema ? `"${schema}"."${functionName}"` : `"${functionName}"`;
  await sequelize.query(`DROP FUNCTION IF EXISTS ${fullFunctionName}(${args});`);
  return { code: 200, metaData: { message: `Đã xóa function ${functionName}` } };
};

module.exports = {
  getAllFunctions,
  dropFunction
}