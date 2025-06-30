const userService = require('../services/user.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const login = async (req, res, next) => {
  const loginUser = await userService.login(req.body)
  res.cookie("refreshToken", loginUser.metaData.tokens.refreshToken, {
    httpOnly: true,                      // chống XSS
    secure: false, // HTTPS only ở production
    sameSite: "Strict",          // cookie chỉ gửi tới endpoint này
    maxAge: 2 * 60 * 1000,
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
  const resetTokentUser = await userService.handlerRefreshToken({ refreshToken: req.refreshToken, user: req.user });
  res.cookie("refreshToken", resetTokentUser.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    // path: "/api/refresh-token",          
    maxAge: 24 * 60 * 60 * 1000,
  });
  new SucessReponse({
    message: "reset token successfully !",
    metaData: resetTokentUser
  }).send(res)
}
module.exports = {
  login,
  signUp,
  handlerRefreshToken
}