const express = require("express");
const databaseController = require('../controllers/database.controller.js');
const databaseRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

// databaseRouter.use(authentication);

databaseRouter.route('/connect-database')
  .post(handlerError(databaseController.connectToDatabase))

databaseRouter.route('/disconnect-database')
  .post(handlerError(databaseController.disconnectToDatabase))

databaseRouter.route('/get-all-databases')
  .get(handlerError(databaseController.getAllDatabaseInHost))

module.exports = databaseRouter