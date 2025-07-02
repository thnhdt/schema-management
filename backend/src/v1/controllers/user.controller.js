const userService = require('../services/user.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');
const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const login = async (req, res, next) => {
  const loginUser = await userService.login(req.body)
  res.cookie("refreshToken", loginUser.metaData.tokens.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  new SucessReponse({
    metaData: loginUser
  }).send(res)
};
const signUp = async (req, res, next) => {
  const newUser = await userService.signUp(req.body)
  new CreatedResponse({
    message: 'Register successfully !',
    metaData: newUser
  }).send(res)
};
const handlerRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const decoder = jwt.verify(refreshToken, env.SECRET_KEY);
  const resetTokentUser = await userService.handlerRefreshToken({ refreshToken: req.cookies.refreshToken, user: decoder });
  new SucessReponse({
    message: "reset token successfully !",
    metaData: resetTokentUser
  }).send(res)
}
const getAllUsers = async (req, res, next) => {
  const allUsers = await userService.getAllUsers();
  new SucessReponse({
    message: "Get all users done !",
    metaData: allUsers
  }).send(res)
};
const getState = async (req, res, next) => {
  const { userId } = req.query;
  const targetUser = await userService.getUser(userId);
  new SucessReponse({
    message: "Check auth thành công !",
    metaData: targetUser
  }).send(res)
};
const logout = async (req, res, next) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(1)
  });
  new SucessReponse({
    message: "Log out thành công !",
  }).send(res)
};
module.exports = {
  login,
  signUp,
  handlerRefreshToken,
  getAllUsers,
  logout,
  getState
}