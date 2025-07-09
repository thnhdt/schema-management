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

const forgetPassword = async (req, res, next) => {
  try {
    const result = await userService.forgetPassword(req.body.email);
    new SucessReponse({
      message: result.message
    }).send(res);
  } catch (error) {
    next(error);
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await userService.resetPassword(token, newPassword);
    new SucessReponse({
      message: result.message
    }).send(res);
  } catch (error) {
    next(error);
  }
}

const getAllRoles = async (req, res, next) => {
  try {
    const roles = await userService.getAllRoles();
    new SucessReponse({
      message: 'Lấy danh sách role thành công!',
      metaData: roles
    }).send(res);
  } catch (error) {
    next(error);
  }
}

const updateRole = async (req, res, next) => {
  try {
    const { userId, roles } = req.body;
    const user = await userService.updateRole({ userId, roles });
    new SucessReponse({
      message: 'Cập nhật roles cho user thành công!',
      metaData: user
    }).send(res);
  } catch (error) {
    next(error);
  }
}

const createRoles = async (req, res, next) => {
  try {
    const { roleName, permissions, isCreate } = req.body;
    const role = await userService.createRoles({ roleName, permissions, isCreate });
    new SucessReponse({
      message: 'Tạo role thành công!',
      metaData: role
    }).send(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  signUp,
  handlerRefreshToken,
  getAllUsers,
  logout,
  getState,
  updateUser,
  deleteUser,
  forgetPassword,
  resetPassword,
  getAllRoles,
  updateRole,
  createRoles
}