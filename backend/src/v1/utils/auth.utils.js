const jwt = require('jsonwebtoken');
const { handlerError } = require('../utils/handle-error.util');
const env = require('../config/environment')
const userModel = require('../models/user.model');
const roleModel = require('../models/role.model');
const { AuthFailureError, ForbiddenError, BadResponseError } = require('../cores/error.response');
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
    const userRoles = decoder.roles;
    const userPermissions = await Promise.all(userRoles.map(role => roleModel.findById(role).lean()));
  const isAdmin = userPermissions.some(item => item.name === 'admin');
    req.user = { ...decoder, userPermissions, isAdmin };
    return (next())
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthFailureError('Access token hết hạn!');
    }
    throw new Error(error)
  }
});

const checkPermissionDatabase = handlerError(async (req, res, next) => {
  const userPermissions = req.user.userPermissions;
  try {
    const { id } = req.body?.id ? req.body : req.query;
    const isAdmin = userPermissions.some(item => item.name === 'admin');
    if (!isAdmin) {
      if (
        !Array.isArray(userPermissions) ||
        !userPermissions.some(p =>
          Array.isArray(p.permissions) &&
          p.permissions.some(item => item?.databaseId?.toString() === id)
        )
      ) {
        throw new BadResponseError("Bạn không có quyền truy cập lên database này !");
      }
    }
    return (next())
  } catch (error) {
    throw new Error(error)
  }
});

const checkPermissionTable = handlerError(async (req, res, next) => {
  const userPermissions = req.user.userPermissions;
  let permissionOnDB = {};
  let canUpdateTable = false;
  try {
    const { id } = req.body?.id ? req.body : req.query;
    const isAdmin = userPermissions.some(item => item.name === 'admin');
    if (!isAdmin) {
      if (
        Array.isArray(userPermissions) &&
        userPermissions.some(p =>
          Array.isArray(p.permissions) &&
          p.permissions.some(item => {
            permissionOnDB = item;
            return item?.databaseId?.toString() === id
          })
        )
      ) {
        canUpdateTable = permissionOnDB?.ops.includes('update-table');
      }
    }
    else {
      canUpdateTable = true;
    }
    if (!canUpdateTable) {
      throw new BadResponseError("Bạn không có quyền chỉnh sửa trên table của database này !");
    }
    return (next());
  } catch (error) {
    throw new Error(error)
  }
});

const checkPermissionFunction = handlerError(async (req, res, next) => {
  const userPermissions = req.user.userPermissions;
  let permissionOnDB = {};
  let canUpdateFunction = false;
  try {
    const { id } = req.body?.id ? req.body : req.query;
    const isAdmin = userPermissions.some(item => item.name === 'admin');
    if (!isAdmin) {
      if (
        Array.isArray(userPermissions) &&
        userPermissions.some(p =>
          Array.isArray(p.permissions) &&
          p.permissions.some(item => {
            permissionOnDB = item;
            return item?.databaseId?.toString() === id
          })
        )
      ) {
        canUpdateFunction = permissionOnDB?.ops.includes('update-function');
      }
    }
    else {
      canUpdateFunction = true;
    }
    if (!canUpdateFunction) {
      throw new BadResponseError("Bạn không có quyền chỉnh sửa function trên database này!");
    }
    return (next());
  } catch (error) {
    throw new Error(error)
  }
})

const checkPermissonAddHost = handlerError(async (req, res, next) => {
  try {
    const userPermissions = req.user.userPermissions;
    if (!userPermissions.some(p => p?.isCreate)) {
      throw new BadResponseError("Bạn không có quyền điều chỉnh trên Host và thêm database!")
    }
    return (next());
  } catch (error) {
    throw new Error(error)
  }
})
module.exports = {
  createTokenPair,
  verifyJWT,
  authentication,
  checkPermissionDatabase,
  checkPermissionTable,
  checkPermissionFunction,
  checkPermissonAddHost
}