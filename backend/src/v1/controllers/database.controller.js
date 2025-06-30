const databaseService = require('../services/database.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const createDatabase = async (req, res, next) => {
  const createDatabase = await databaseService.createDatabase(req.body)
  new SucessReponse({
    metaData: createDatabase
  }).send(res)
};
const connectToDatabase = async (req, res, next) => {
  const connectedDatabase = await databaseService.connectToDatabase(req.body)
  new CreatedResponse({
    message: 'Truy cập thành công!',
    metaData: connectedDatabase
  }).send(res)
};
const disconnectToDatabase = async (req, res, next) => {
  const disconnectedDatabase = await databaseService.disconnectDb(req.body)
  new CreatedResponse({
    message: 'Disconnect thành công!',
    metaData: disconnectedDatabase
  }).send(res)
};
const getAllDatabaseInHost = async (req, res, next) => {
  const allDatabases = await databaseService.getAllDatabaseInHost(req.query)
  new SucessReponse({
    message: 'get all databases thành công!',
    metaData: allDatabases
  }).send(res)
}
module.exports = {
  createDatabase,
  connectToDatabase,
  disconnectToDatabase,
  getAllDatabaseInHost
}