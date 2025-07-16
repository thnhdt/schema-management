const { POOLMAP } = require('./database.service');
const { BadResponseError, NotFoundError } = require('../cores/error.response');
const { ddl } = require('../utils/helper.utils');
const { QueryTypes } = require('sequelize');
var _ = require('underscore')
const { diffLines } = require('diff');
const databaseService = require('../services/database.service');
const databaseModel = require('../models/database.model');


const createConditionOnTables = (key, listTablePriority) => {
  if (!listTablePriority || listTablePriority.length === 0) return '';

  const condition = listTablePriority
    .map(item => `${key} LIKE '${item}'`)
    .join(' OR\n');

  return condition;
};
const getAllFunctions = async (reqBody) => {
  const { schema, id, listPriorityFunction = [] } = reqBody;
  const condition = createConditionOnTables('p.proname', listPriorityFunction)
  const sequelizeDatabase = await databaseService.connectToDatabase({ id });
  const allFunction = await sequelizeDatabase.query(
    `WITH func AS (
    SELECT
        p.oid,
        n.nspname,
        p.proname,
        COALESCE(
            (
                SELECT string_agg(t.typname, ', ' ORDER BY a.ord)
                FROM unnest(p.proargtypes) WITH ORDINALITY AS a(type_oid, ord)
                JOIN pg_type t ON t.oid = a.type_oid
            ),
            ''
        ) AS argtypes
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = :schema ${listPriorityFunction.length > 0 ? `AND (${condition})` : ''}
)

SELECT
    f.nspname                     AS "functionSchema",
    f.proname                     AS "functionName",
    pg_get_function_arguments(f.oid) AS "functionArguments",
    f.argtypes                    AS "argumentTypes",
    f.nspname || '.' || f.proname || '(' || f.argtypes || ')' AS "regprocName",
    CASE
        WHEN l.lanname = 'internal' THEN p.prosrc
        ELSE pg_get_functiondef(
            (f.nspname || '.' || f.proname || '(' || f.argtypes || ')')::regprocedure
        )
    END AS "definition"
FROM func f
JOIN pg_proc p ON p.oid = f.oid
LEFT JOIN pg_language l ON l.oid = p.prolang
ORDER BY "functionSchema", "functionName";`,
    {
      replacements: { schema },
      type: QueryTypes.SELECT
    }
  );
  const targetAllFunction = allFunction.map(item => ({ ...item, definition: item.definition.replace(/\r\n/g, '\n') }));
  await sequelizeDatabase.close();
  return {
    code: 200,
    metaData: {
      data: targetAllFunction
    }
  }
};

const dropFunction = async ({ id, functionName, args = '', schema = 'public' }) => {
  const sequelizeDatabase = await databaseService.connectToDatabase({ id });
  const fullFunctionName = schema ? `"${schema}"."${functionName}"` : `"${functionName}"`;
  await sequelizeDatabase.query(`DROP FUNCTION IF EXISTS ${fullFunctionName}(${args});`);
  await sequelizeDatabase.close();
  return { code: 200, metaData: { message: `Đã xóa function ${functionName}` } };
};

const checkExistInPrime = (arrFunctionPrime, fn, mapFuntion) => {
  const sameNameFns = arrFunctionPrime.filter(
    f => f.functionName === fn.functionName
  );

  if (sameNameFns.length === 1) {
    const primeFn = sameNameFns[0];
    const key = `${primeFn.functionName}(${primeFn.functionArguments})`;
    const rec = mapFuntion.get(key);
    if (rec) {
      rec.right = fn;
      rec.sameParameters = false;
    }
    return true;
  }
  return false;
};

const mergeFunctions = (arrFunctionPrime, arrFunctionSecond) => {
  const map = new Map();

  for (const fn of arrFunctionPrime) {
    const key = `${fn.functionName}(${fn.functionArguments})`;
    map.set(key, { left: fn, right: null, sameParameters: true });
  }

  for (const fn of arrFunctionSecond) {
    const key = `${fn.functionName}(${fn.functionArguments})`;
    if (map.has(key)) {
      map.get(key).right = fn;
    } else {
      const paired = checkExistInPrime(arrFunctionPrime, fn, map);
      if (!paired) {
        map.set(key, { left: null, right: fn, sameParameters: true });
      }
    }
  }
  return Array.from(map.values());
}

const getAllUpdate = async (reqBody, user) => {
  const { currentDatabaseId, targetDatabaseId, listPriorityFunction = [] } = reqBody;
  if (!user.isAdmin) {
    const permissions = user.userPermissions.some(role => role?.permissions.some(p => p.databaseId.toString() === targetDatabaseId) && role?.permissions.some(p => p.databaseId.toString() === currentDatabaseId));
    if (!permissions) throw new BadResponseError("Bạn không có quyền truy cập một trong hai DB !");
  }
  const [currentDatabase, targetDatabase] = await Promise.all([databaseModel.findById(currentDatabaseId).lean(), databaseModel.findById(targetDatabaseId).lean()]);
  if (!currentDatabase || !targetDatabase) throw new BadResponseError("Một trong hai database không tồn tại !");
  const [defaultAllCurrentFunction, defaultAllTargetFunction] = await Promise.all([getAllFunctions({ schema: 'public', id: currentDatabaseId, listPriorityFunction: listPriorityFunction }), getAllFunctions({ schema: 'public', id: targetDatabaseId, listPriorityFunction: listPriorityFunction })]);

  const allCurrentFunction = defaultAllCurrentFunction.metaData.data;
  const allTargetFunction = defaultAllTargetFunction.metaData.data;

  const mapFunction = mergeFunctions(allTargetFunction, allCurrentFunction);
  const resultUpdate = (
    await Promise.all(
      mapFunction.map(async fn => {
        const cmp = await compareFunctionInPosgresql({
          secondFunction: fn.left,
          primeFunction: fn.right,
          sameParameters: fn.sameParameters
        });
        if (!cmp.hasChange) return null;
        const key = fn.left ? `${fn.left.functionName}(${fn.left.functionArguments})` : `${fn.right.functionName}(${fn.right.functionArguments})`
        return {
          key: key,
          patch: cmp.patch,
          ddlPrimeFunction: cmp.ddlPrimeFunction,
          ddlSecondFunction: cmp.ddlSecondFunction,
          type: cmp.type
        };
      })
    )
  ).filter(Boolean);
  let ddlSchema = '';
  resultUpdate.forEach(item => ddlSchema += item.patch + ';' + '\n');
  return {
    code: 200,
    allPatchDdl: ddlSchema,
    // mapFunction,
    resultUpdate,
    currentDatabase: currentDatabase.name,
    targetDatabase: targetDatabase.name
  }
}

const compareFunctionInPosgresql = async (reqBody) => {
  const { secondFunction, primeFunction, sameParameters } = reqBody;
  let ddlPrimeFunction = '';
  let ddlSecondFunction = '';
  if (primeFunction) {
    ddlPrimeFunction = primeFunction.definition;
  }
  if (secondFunction) {
    ddlSecondFunction = secondFunction.definition;
  }
  const diffScipt = diffLines(ddlSecondFunction, ddlPrimeFunction);
  const hasChange = diffScipt.some(p => p.added || p.removed);
  let patch;
  let type;
  if (ddlSecondFunction && ddlPrimeFunction) {
    if (sameParameters) {
      patch = ddlSecondFunction.replace(/CREATE FUNCTION/i, 'CREATE OR REPLACE FUNCTION');
      type = "UPDATE";
    }
    else {
      // const functionName = primeFunction.functionName;
      // const functionArgs = primeFunction.functionArguments;
      const regprocName = primeFunction.regprocName;
      const dropStmt = `DROP FUNCTION IF EXISTS ${regprocName};`;
      const createStmt = ddlSecondFunction.replace(/CREATE FUNCTION/i, 'CREATE OR REPLACE FUNCTION');
      patch = `${dropStmt}\n${createStmt}`;
      type = "UPDATE";
    }
  }
  else if (!ddlSecondFunction) {
    // const functionName = primeFunction.functionName;
    // const functionArgs = primeFunction.functionArguments;
    const regprocName = primeFunction.regprocName;
    const dropStmt = `DROP FUNCTION IF EXISTS ${regprocName}`;
    patch = dropStmt;
    type = "DELETE"
  }
  else {
    patch = ddlSecondFunction.replace(/CREATE FUNCTION/i, 'CREATE OR REPLACE FUNCTION');
    type = "CREATE"
  }
  return {
    hasChange,
    patch,
    ddlPrimeFunction, ddlSecondFunction,
    type
  }
}

module.exports = {
  getAllFunctions,
  compareFunctionInPosgresql,
  getAllUpdate,
  dropFunction
}