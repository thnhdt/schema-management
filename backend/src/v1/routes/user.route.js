const express = require("express");
const UserController = require('../controllers/user.controller.js');
const userRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

userRouter.route('/signup')
  .post(handlerError(UserController.signUp))
userRouter.route('/login')
  .post(handlerError(UserController.login))

userRouter.route('/refresh-token')
  .post(handlerError(UserController.handlerRefreshToken))

userRouter.route('/refresh-token')
  .post(handlerError(UserController.handlerRefreshToken))
module.exports = userRouter