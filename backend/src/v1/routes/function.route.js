const express = require("express");
const functionController = require('../controllers/function.controller.js');
const functionRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

functionRouter.use(authentication);
functionRouter.route('/get-all-functions')
  .get(handlerError(functionController.getAllFunctions))
functionRouter.route('/drop-function')
  .post(handlerError(functionController.dropFunction))
module.exports = functionRouter