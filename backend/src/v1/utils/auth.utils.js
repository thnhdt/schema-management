const jwt = require('jsonwebtoken');
const { handlerError } = require('../utils/handle-error.util');
const env = require('../config/environment')

const { AuthFailureError, ForbiddenError } = require('../cores/error.response');
const HEADER = {
  CLIENT_ID: 'userid',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'refreshtoken'
}

const createTokenPair = (payload, scretKey) => {
  const accessToken = jwt.sign(payload, scretKey, {
    // algorithm: 'RS256',
    expiresIn: '5m'
  })
  const refreshToken = jwt.sign(payload, scretKey, {
    // algorithm: 'RS256',
    expiresIn: '1d'
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

  const checkRefreshToken = req.cookies.refreshToken;

  const authHeader = req.headers[HEADER.AUTHORIZATION];
  const accessToken = authHeader.split(' ')[1];
  if (!checkRefreshToken) throw new ForbiddenError("Phiên đăng nhập hết hạn!");
  if (!accessToken) throw new AuthFailureError("Access token hết hạn!");
  try {
    const decoder = jwt.verify(accessToken, env.SECRET_KEY);
    if (userId !== decoder.userId) throw new AuthFailureError("UserId is error !");
    req.user = decoder
    return (next())
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthFailureError('Access token hết hạn!');
    }
    throw new Error(error)
  }
});
module.exports = {
  createTokenPair,
  verifyJWT,
  authentication
}