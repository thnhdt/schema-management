const express = require("express");
const databaseController = require('../controllers/database.controller.js');
const databaseRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication, checkPermissionDatabase } = require('../utils/auth.utils.js');

databaseRouter.use(authentication);
// databaseRouter.use(checkPermissionDatabase);

databaseRouter.route('/connect-database')
  .post(handlerError(databaseController.connectToDatabase))

databaseRouter.route('/create-database')
  .post(handlerError(databaseController.createDatabase))


databaseRouter.route('/disconnect-database')
  .post(handlerError(databaseController.disconnectToDatabase))

databaseRouter.route('/get-all-databases')
  .get(handlerError(databaseController.getAllDatabaseInHost))

databaseRouter.route('/')
  .put(handlerError(databaseController.editDatabase))
databaseRouter.route('/:id')
  .delete(handlerError(databaseController.deleteDatabase))

module.exports = databaseRouter