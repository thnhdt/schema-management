const express = require("express");
const tableController = require('../controllers/table.controller.js');
const tableRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

// tableRouter.use(authentication)
tableRouter.route('/get-all-tables')
  .get(handlerError(tableController.getAllTables))

tableRouter.route('/get-ddl-text')
  .get(handlerError(tableController.getAllDdlText))

tableRouter.route('/test')
  .post(handlerError(tableController.test))

tableRouter.route('/create-schema')
  .post(handlerError(tableController.createSchema))

tableRouter.route('/drop-column')
  .post(handlerError(tableController.dropColumn))

tableRouter.route('/delete-row')
  .post(handlerError(tableController.deleteRow))

tableRouter.route('/drop-table')
  .post(handlerError(tableController.dropTable))

tableRouter.route('/get-columns')
  .get(handlerError(tableController.getColumns))

tableRouter.route('/all-update-tables')
  .post(handlerError(tableController.getAllUpdateOnTables))

module.exports = tableRouter