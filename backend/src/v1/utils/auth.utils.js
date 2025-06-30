const jwt = require('jsonwebtoken');
const { handlerError } = require('../utils/handle-error.util');
const env = require('../config/environment')

const { AuthFailureError, ForbiddenError } = require('../cores/error.response');
const HEADER = {
  CLIENT_ID: 'userId',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'refreshtoken'
}

const createTokenPair = (payload, scretKey) => {
  const accessToken = jwt.sign(payload, scretKey, {
    // algorithm: 'RS256',
    expiresIn: '1m'
  })
  const refreshToken = jwt.sign(payload, scretKey, {
    // algorithm: 'RS256',
    expiresIn: '2m'
  })
  return { accessToken, refreshToken }
}

const verifyJWT = (refreshToken, scretKey) => {
  return jwt.verify(refreshToken, scretKey)
}

const authentication = handlerError(async (req, res, next) => {
  // check userId 
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new ForbiddenError("Invalid request !");
  // check access token
  // const checkRefreshToken = req.headers[HEADER.REFRESH_TOKEN];
  const checkRefreshToken = req.cookies.refreshToken;
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!checkRefreshToken && !accessToken) throw new ForbiddenError("Phiên đăng nhập hết hạn!");
  if (!accessToken) throw new AuthFailureError("Access token hết hạn!");
  //verify refresh token 
  // if (req.headers[HEADER.REFRESH_TOKEN] && !accessToken) {
  //   try {
  //     const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
  //     const decoder = jwt.verify(refreshToken, env.SECRET_KEY);
  //     if (userId !== decoder.userId) throw new AuthFailureError("UserId is error !");
  //     req.user = decoder
  //     req.refreshToken = refreshToken
  //     return (next())
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }
  // verify access token
  try {
    const decoder = jwt.verify(accessToken, env.SECRET_KEY);
    if (userId !== decoder.userId) throw new AuthFailureError("UserId is error !");
    req.user = decoder
    return (next())
  } catch (error) {
    throw new Error(error)
  }
});
module.exports = {
  createTokenPair,
  verifyJWT,
  authentication
}