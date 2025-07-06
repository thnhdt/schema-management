const userService = require('../services/user.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');
const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const login = async (req, res, next) => {
  const loginUser = await userService.login(req.body)
  res.cookie("refreshToken", loginUser.metaData.tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
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
const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(req.body);
    new SucessReponse({
      message: "Cập nhật user thành công!",
      metaData: updatedUser
    }).send(res);
  } catch (error) {
    next(error);
  }
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
    sameSite: "None",
    expires: new Date(1)
  });
  new SucessReponse({
    message: "Log out thành công !",
  }).send(res)
};
const deleteUser = async (req, res, next) => {
  try {
    const deleted = await userService.deleteUser(req.body._id);
    new SucessReponse({
      message: "Xóa user thành công!",
      metaData: deleted
    }).send(res);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  login,
  signUp,
  handlerRefreshToken,
  getAllUsers,
  logout,
  getState,
  updateUser,
  deleteUser
}