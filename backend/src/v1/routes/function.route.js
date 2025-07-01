const express = require("express");
const functionController = require('../controllers/function.controller.js');
const functionRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

functionRouter.use(authentication);
functionRouter.route('/get-all-functions')
  .get(handlerError(functionController.getAllFunctions))
module.exports = functionRouter