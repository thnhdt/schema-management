const express = require("express");
const UserController = require('../controllers/user.controller.js');
const userRouter = express.Router();
const { handlerError } = require('../utils/handle-error.util.js');
const { authentication } = require('../utils/auth.utils.js');

userRouter.route('/refresh-token')
  .post(handlerError(UserController.handlerRefreshToken));

userRouter.route('/forget-password')
  .post(handlerError(UserController.forgetPassword));

userRouter.route('/signup')
  .post(handlerError(UserController.signUp));
userRouter.route('/login')
  .post(handlerError(UserController.login));
userRouter.route('/logout')
  .post(handlerError(UserController.logout));
userRouter.route('/reset-password')
  .post(handlerError(UserController.resetPassword));

userRouter.use(authentication);
userRouter.route('/get-all-users')
  .get(handlerError(UserController.getAllUsers));

userRouter.route('/get-all-roles')
  .get(handlerError(UserController.getAllRoles));

userRouter.route('/update-role')
  .post(handlerError(UserController.updateRole));

userRouter.route('/create-role')
  .post(handlerError(UserController.createRoles));

userRouter.route('/update-user')
  .patch(handlerError(UserController.updateUser));

userRouter.route('/get-state')
  .get(handlerError(UserController.getState));

userRouter.route('/delete-user')
  .delete(handlerError(UserController.deleteUser));

module.exports = userRouter