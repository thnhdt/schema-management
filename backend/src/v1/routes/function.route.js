const express = require("express");
const functionController = require('../controllers/function.controller.js');
const functionRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication, checkPermissionDatabase } = require('../utils/auth.utils.js');

functionRouter.use(authentication);
// functionRouter.use(checkPermissionDatabase);

functionRouter.route('/get-all-functions')
  .get(handlerError(functionController.getAllFunctions))
functionRouter.route('/drop-function')
  .post(handlerError(functionController.dropFunction))
functionRouter.route('/compare-diff-functions')
  .get(handlerError(functionController.compareFunctionInPosgresql))
functionRouter.route('/all-update-functions')
  .post(handlerError(functionController.getAllUpdate))
module.exports = functionRouter