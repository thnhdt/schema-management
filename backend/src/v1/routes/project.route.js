const express = require("express");
const projectController = require('../controllers/project.controller.js');
const projectRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

projectRouter.use(authentication);
projectRouter.route('/get-all-project')
  .get(handlerError(projectController.getAllProject))
projectRouter.route('/create-project')
  .post(handlerError(projectController.createProject))
projectRouter.route('/edit-project')
  .patch(handlerError(projectController.editProject))
projectRouter.route('/drop-project')
  .delete(handlerError(projectController.dropProject))
projectRouter.route('/get-prefixes')
  .get(handlerError(projectController.getPrefixes))
module.exports = projectRouter