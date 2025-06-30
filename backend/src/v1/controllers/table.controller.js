const tableService = require('../services/table.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const test = async (req, res, next) => {
  const test = await tableService.test(req.body)
  new SucessReponse({
    metaData: test
  }).send(res)
};
const createSchema = async (req, res, next) => {
  const targetData = await tableService.createSchema(req.body)
  new SucessReponse({
    metaData: targetData
  }).send(res)
};
const getAllTables = async (req, res, next) => {
  const targetData = await tableService.getAllTables(req.query)
  new SucessReponse({
    metaData: targetData
  }).send(res)
};
const getAllDdlText = async (req, res, next) => {
  const targetData = await tableService.getAllDdlText(req.query)
  new SucessReponse({
    metaData: targetData
  }).send(res)
};
module.exports = {
  test,
  createSchema,
  getAllTables,
  getAllDdlText
}