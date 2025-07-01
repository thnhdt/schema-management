const express = require("express");
const nodeController = require('../controllers/node.controller.js');
const nodeRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

nodeRouter.use(authentication);
nodeRouter.route('/create-node')
  .post(handlerError(nodeController.createNode))

nodeRouter.route('/get-all-nodes')
  .get(handlerError(nodeController.getAllNodes))

module.exports = nodeRouter