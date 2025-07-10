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
const dropColumn = async (req, res, next) => {
  const result = await tableService.dropColumn(req.body);
  new SucessReponse({
    metaData: result
  }).send(res);
};
const deleteRow = async (req, res, next) => {
  const result = await tableService.deleteRow(req.body);
  new SucessReponse({ metaData: result }).send(res);
};
const dropTable = async (req, res, next) => {
  const result = await tableService.dropTable(req.body);
  new SucessReponse({ metaData: result }).send(res);
};
const getColumns = async (req, res, next) => {
  const result = await tableService.getColumns(req.query);
  new SucessReponse({ metaData: result }).send(res);
};
const getAllUpdateOnTables = async (req, res, next) => {
  const result = await tableService.getAllUpdateOnTables(req.body, req.user);
  new SucessReponse({ metaData: result }).send(res);
};
const getAllUpdateDdl = async (req, res, next) => {
  const result = await tableService.getAllUpdateDdl(req.body, req.user);
  new SucessReponse({ metaData: result }).send(res);
};

const syncDatabase = async (req, res, next) => {
  const result = await tableService.syncDatabase(req.body, req.user);
  new SucessReponse({ metaData: result }).send(res);
};

const saveDBHistory = async (req, res, next) => {
  try {
    const { databaseId } = req.body;
    const result = await tableService.saveDBHistory(databaseId);
    new SucessReponse({ metaData: result }).send(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  test,
  createSchema,
  getAllTables,
  getAllDdlText,
  dropColumn,
  deleteRow,
  dropTable,
  getColumns,
  getAllUpdateOnTables,
  getAllUpdateDdl,
  syncDatabase,
  saveDBHistory
}