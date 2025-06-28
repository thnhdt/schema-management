const jwt = require('jsonwebtoken');
const { handlerError } = require('../utils/handle-error.util');
const env = require('../config/environment')


const HEADER = {
  CLIENT_ID: 'userId',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'refreshtoken'
}

const createTokenPair = (payload, scretKey) => {
  const accessToken = jwt.sign(payload, scretKey, {
    algorithm: 'RS256',
    expiresIn: '15 minitues'
  })
  const refreshToken = jwt.sign(payload, scretKey, {
    algorithm: 'RS256',
    expiresIn: '1 days'
  })
  return { accessToken, refreshToken }
}
const verifyJWT = (refreshToken, scretKey) => {
  return jwt.verify(refreshToken, scretKey)
}

const authentication = handlerError(async (req, res, next) => {
  // check userId 
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError("Invalid request !")
  // check access token
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError("Invalid request !")

  //verify refresh token 
  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
      const decoder = jwt.verify(refreshToken,)
      if (userId !== decoder.userId) throw new AuthFailureError("UserId is error !")
      req.user = decoder
      req.refreshToken = refreshToken
      req.keyStore = keyStore
      return (next())
    } catch (error) {
      throw new Error(error)
    }
  }
  // verify access token
  try {
    const decoder = jwt.verify(accessToken, env.SECRET_KEY)
    if (userId !== decoder.userId) throw new AuthFailureError("UserId is error !")
    req.user = decoder
    req.keyStore = keyStore
    return (next())
  } catch (error) {
    throw new Error(error)
  }

})
module.exports = {
  createTokenPair,
  verifyJWT,
  authentication
}