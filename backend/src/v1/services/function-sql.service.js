const { POOLMAP } = require('./database.service');
const { BadResponseError, NotFoundError } = require('../cores/error.response');
const { ddl } = require('../utils/helper.utils');
const { QueryTypes } = require('sequelize');
var _ = require('underscore')
const { diffLines } = require('diff');
const databaseService = require('../services/database.service');
const databaseModel = require('../models/database.model');

const getAllFunctions = async (reqBody) => {
  const { schema, id } = reqBody;
  // if (!POOLMAP.has(id)) throw new BadResponseError("Chưa kết nối với database!");
  const sequelizeDatatabase = await databaseService.connectToDatabase({ id });

  // const allFunction = await POOLMAP.get(id).sequelize.query(
  const allFunction = await sequelizeDatatabase.query(
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
    WHERE n.nspname = :schema
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
  await sequelizeDatatabase.close();
  return {
    code: 200,
    metaData: {
      data: targetAllFunction
    }
  }
};

const dropFunction = async ({ id, functionName, args = '', schema = 'public' }) => {
  // if (!POOLMAP.has(id)) throw new BadResponseError('Chưa kết nối với database!');
  // const sequelize = POOLMAP.get(id).sequelize;
  const sequelizeDatatabase = await databaseService.connectToDatabase({ id });
  const fullFunctionName = schema ? `"${schema}"."${functionName}"` : `"${functionName}"`;
  await sequelizeDatatabase.query(`DROP FUNCTION IF EXISTS ${fullFunctionName}(${args});`);
  await sequelizeDatatabase.close();
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

const getAllUpdate = async (reqBody) => {
  const { currentDatabaseId, targetDatabaseId } = reqBody;
  const currentDatabase = await databaseModel.findById(currentDatabaseId).lean();
  const targetDatabase = await databaseModel.findById(targetDatabaseId).lean();
  if (!currentDatabase || !targetDatabase) throw new BadResponseError("Một trong hai database không tồn tại !")
  // const currentDatabaseSquelize = POOLMAP.get(currentDatabaseId).sequelize;
  // const currentDatabaseSquelize = await databaseService.connectToDatabase({ currentDatabaseId });
  // const targetDatabaseSequelixe = POOLMAP.get(targetDatabaseId).sequelize;
  // const targetDatabaseSequelize = await databaseService.connectToDatabase({ targetDatabaseId });
  // if (!currentDatabaseSquelize || !targetDatabaseSequelize) throw new NotFoundError("Cả hai database chưa được !");
  const defaultAllCurrentFunction = await getAllFunctions({ schema: 'public', id: currentDatabaseId });
  const defaultAllTargetFunction = await getAllFunctions({ schema: 'public', id: targetDatabaseId });

  const allCurrentFunction = defaultAllCurrentFunction.metaData.data;
  const allTargetFunction = defaultAllTargetFunction.metaData.data;
  // xem loop so sánh với các hàm trùng tên -> trùng params
  const mapFunction = mergeFunctions(allTargetFunction, allCurrentFunction);
  const resultUpdate = (
    await Promise.all(
      mapFunction.map(async fn => {
        const cmp = await compareFunctionInPosgresql({
          secondFunction: fn.left,
          primeFunction: fn.right,
          databasePrimeId: targetDatabaseId,
          databaseSecondId: currentDatabaseId,
          sameParameters: fn.sameParameters
        });
        if (!cmp.hasChange) return null;
        const key = fn.left ? `Cập nhật trên hàm ${fn.left.functionName}(${fn.left.functionArguments})` : `Cập nhật trên hàm ${fn.right.functionName}(${fn.right.functionArguments})`

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
  // await Promise.all([currentDatabaseSquelize, targetDatabaseSequelize].map((p) => p.sequelize.close()));
  return {
    code: 200,
    mapFunction,
    resultUpdate,
    currentDatabase: currentDatabase.name,
    targetDatabase: targetDatabase.name
  }
}

const compareFunctionInPosgresql = async (reqBody) => {
  const { secondFunction, primeFunction, databasePrimeId, databaseSecondId, sameParmameters } = reqBody;
  // const primeClient = POOLMAP.get(databasePrimeId).sequelize;
  // const secondClient = POOLMAP.get(databaseSecondId).sequelize;
  let ddlPrimeFunction = '';
  let ddlSecondFunction = '';
  if (primeFunction) {
    // const functionName = `${primeFunction.functionName}(${primeFunction.functionArguments})`
    // ddlPrimeFunction = await primeClient.query(
    //   'SELECT pg_get_functiondef(:functionName::regprocedure) AS ddl;',
    //   {
    //     replacements: { functionName },
    //     type: QueryTypes.SELECT
    //   }
    // );
    ddlPrimeFunction = primeFunction.definition;
  }
  if (secondFunction) {
    // const functionName = `${secondFunction.functionName}(${secondFunction.functionArguments})`
    // ddlSecondFunction = await secondClient.query(
    //   'SELECT pg_get_functiondef(:functionName ::regprocedure) AS ddl;',
    //   {
    //     replacements: { functionName },
    //     type: QueryTypes.SELECT
    //   }
    // );
    ddlSecondFunction = secondFunction.definition;
  }

  const diffScipt = diffLines(ddlSecondFunction, ddlPrimeFunction);
  const hasChange = diffScipt.some(p => p.added || p.removed);
  let patch;
  let type;
  if (ddlSecondFunction && ddlPrimeFunction) {
    if (sameParmameters) {
      patch = ddlPrimeFunction.replace(/CREATE FUNCTION/i, 'CREATE OR REPLACE FUNCTION');
      type = "UPDATE";
    }
    else {
      const functionName = primeFunction.functionName;
      const functionArgs = primeFunction.functionArguments;
      const dropStmt = `DROP FUNCTION ${functionName}(${functionArgs});`;
      const createStmt = ddlPrimeFunction.replace(/CREATE FUNCTION/i, 'CREATE OR REPLACE FUNCTION');
      patch = `${dropStmt}\n${createStmt}`;
      type = "UPDATE";
    }
  }
  else if (!ddlSecondFunction) {
    const functionName = primeFunction.functionName;
    const functionArgs = primeFunction.functionArguments;
    const dropStmt = `DROP FUNCTION ${functionName}(${functionArgs});`;
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