const express = require("express");
const tableController = require('../controllers/table.controller.js');
const tableRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');


tableRouter.route('/get-all-tables')
  .get(handlerError(tableController.getAllTables))
tableRouter.route('/get-ddl-text')
  .get(handlerError(tableController.getAllDdlText))
tableRouter.route('/test')
  .post(handlerError(tableController.test))
tableRouter.route('/create-schema')
  .post(handlerError(tableController.createSchema))

module.exports = tableRouter