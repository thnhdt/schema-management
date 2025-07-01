const express = require("express");
const sequenceController = require('../controllers/sequence.controller.js');
const sequenceRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

sequenceRouter.use(authentication);
sequenceRouter.route('/get-all-sequences')
  .get(handlerError(sequenceController.getAllSequence))
module.exports = sequenceRouter