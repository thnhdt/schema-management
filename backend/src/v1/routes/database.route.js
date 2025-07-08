const express = require("express");
const databaseController = require('../controllers/database.controller.js');
const databaseRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication, checkPermissionDatabase, checkPermissonAddHost } = require('../utils/auth.utils.js');

databaseRouter.use(authentication);

databaseRouter.route('/get-all-databases')
  .get(handlerError(databaseController.getAllDatabaseInHost));

databaseRouter.route('/create-database')
  .post(checkPermissonAddHost, handlerError(databaseController.createDatabase));
databaseRouter.route('/')
  .put(checkPermissonAddHost, handlerError(databaseController.editDatabase));
databaseRouter.route('/:id')
  .delete(checkPermissonAddHost, handlerError(databaseController.deleteDatabase));

databaseRouter.use(checkPermissionDatabase);
databaseRouter.route('/connect-database')
  .post(handlerError(databaseController.connectToDatabase));

databaseRouter.route('/disconnect-database')
  .post(handlerError(databaseController.disconnectToDatabase));

module.exports = databaseRouter