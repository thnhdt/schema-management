const functionService = require('../services/function-sql.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const getAllFunctions = async (req, res, next) => {
  const targetData = await functionService.getAllFunctions(req.query);
  new SucessReponse({
    metaData: targetData
  }).send(res)
};
const dropFunction = async (req, res, next) => {
  const result = await functionService.dropFunction(req.body);
  new SucessReponse({ metaData: result }).send(res);
};
const compareFunctionInPosgresql = async (req, res, next) => {
  const targetData = await functionService.compareFunctionInPosgresql(req.query);
  new SucessReponse({
    metaData: targetData
  }).send(res)
}
const getAllUpdate = async (req, res, next) => {
  const targetData = await functionService.getAllUpdate(req.body);
  new SucessReponse({
    metaData: targetData
  }).send(res)
}
module.exports = {
  getAllFunctions,
  compareFunctionInPosgresql,
  getAllUpdate,
  dropFunction
}