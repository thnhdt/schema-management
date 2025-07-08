const userModel = require('../models/user.model');
const env = require('../config/environment');
const { createTokenPair } = require('../utils/auth.utils');
const bcrypt = require('bcrypt');
const { AuthFailureError, ForbiddenError, BadResponseError } = require('../cores/error.response');
const mongoose = require('mongoose');
const roleModel = require('../models/role.model');

const signUp = async (dataCreated) => {
  const { email } = dataCreated
  const validateEmail = await userModel.findOne({ email }).lean();
  if (validateEmail) {
    throw new BadResponseError("Error: User is exist !")
  }
  const salt = await bcrypt.genSalt(parseInt(env.SALT));
  const hashPassword = await bcrypt.hash(dataCreated.password, salt);
  const newUser = await userModel.create({ ...dataCreated, password: hashPassword });
  if (newUser) {
    // sign access token va refresh token
    const tokens = await createTokenPair({ userId: newUser._id, email, roles: newUser.roles }, env.SECRET_KEY)
    return {
      code: 201,
      metaData: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email
        },
        tokens
      }
    }
  }
  return {
    code: 200,
    metaData: null
  }
}

const login = async ({ email, password, refreshToken = null }) => {

  const targetUser = await userModel.findOne({ email }).lean()
  if (!targetUser) {
    throw new AuthFailureError("Error: Email is not Exist !")
  }
  const isMatchPassword = await bcrypt.compare(password, targetUser.password);
  if (!isMatchPassword) {
    throw new BadResponseError("Error: PassWord is incorrect !");
  }
  //tao 2 access token va refresh token
  const tokens = await createTokenPair({ userId: targetUser._id, email, roles: targetUser.roles }, env.SECRET_KEY);
  const userPermissions = await Promise.all(targetUser.roles.map(role => roleModel.findById(role)));
  const isAdmin = userPermissions.some(item => item.name === 'admin');
  return {
    metaData: {
      user: {
        userId: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        roles: userPermissions,
        isAdmin
      },
      tokens
    }
  }
};

const handlerRefreshToken = async ({ user, refreshToken }) => {
  const { userId } = user
  if (!refreshToken) throw new ForbiddenError("User is not login!");
  const targetUser = await userModel.findById(userId);
  if (!targetUser) throw new ForbiddenError("User is not register !");
  const userPermissions = await Promise.all(targetUser.roles.map(role => roleModel.findById(role)));
  const isAdmin = userPermissions.some(item => item.name === 'admin');
  console.log("handlerRefreshToken:isAdmin", isAdmin);
  const tokens = await createTokenPair({ userId: targetUser._id, name: targetUser.name, roles: targetUser.roles }, env.SECRET_KEY);
  return {
    user: { ...user, isAdmin },
    tokens
  }
}
const getAllUsers = async () => {
  const targetUser = await userModel.find({}, '_id name roles').sort({ createdAt: -1 }).lean();
  return targetUser
}

const getUser = async (userId) => {
  const targetUser = await userModel.find({ _id: new mongoose.Types.ObjectId(userId) }, '_id name roles').sort({ createdAt: -1 }).lean();
  return { ...targetUser[0], isAdmin }
}

const updateUser = async (dataUpdate) => {
  const { _id, name, roles, email } = dataUpdate;
  if (!_id) throw new BadResponseError('Missing user id');
  const updated = await userModel.findByIdAndUpdate(
    _id,
    { name, roles, email },
    { new: true, fields: '_id name roles email' }
  ).lean();
  if (!updated) throw new BadResponseError('User not found');
  return updated;
}

const deleteUser = async (_id) => {
  if (!_id) throw new BadResponseError('Missing user id');
  const deleted = await userModel.findByIdAndDelete(_id, { projection: '_id name roles email' }).lean();
  if (!deleted) throw new BadResponseError('User not found');
  return deleted;
}


// permission : mảng các id của database, có thể set quyền host -> username + tên databaese  -> UI, do quyền chỉnh sửa 
// DB dựa trên quyền của user name GRANT quyền ở dưới DB
module.exports = {
  signUp,
  login,
  handlerRefreshToken,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
}