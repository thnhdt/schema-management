const userModel = require('../models/user.model');
const env = require('../config/environment');
const { createKeyToken } = require('../utils/auth.utils');
const signUp = async (dataCreated) => {
  const { email } = dataCreated
  const validateEmail = await userModel.findOne({ email }).lean()
  if (validateEmail) {
    throw new BadResponseError("Error: User is exist !")
  }
  const salt = await bcrypt.genSalt(parseInt(env.SALT));
  const hashPassword = await bcrypt.hash(dataCreated.password, salt);
  const newUser = await userModel.create({ ...dataCreated, password: hashPassword })
  if (newUser) {
    // sign access token va refresh token
    const tokens = await createTokenPair({ userId: newUser._id, email }, env.SECRET_KEY)
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
  //kiem tra email co ton tai
  const targetUser = await userModel.findOne({ email }).lean()
  if (!targetUser) {
    throw new AuthFailureError("Error: Email is not Exist !")
  }
  //kiem tra mat khau co match hay khong
  const isMatchPassword = bcrypt.compare(password, targetUser.password)
  if (!isMatchPassword) {
    throw new BadResponseError("Error: PassWord is incorrect !")
  }
  //tao public key va private key
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    }
  })
  //tao 2 access token va refresh token
  const tokens = await createTokenPair({ userId: targetUser._id, email }, publicKey, privateKey)
  //luu thay doi va luu refresh token key
  await keyTokenService.createKeyToken({ publicKey: publicKey, userId: targetUser._id, refreshToken: tokens.refreshToken })
  return {
    metaData: {
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email
      },
      tokens
    }
  }
}
module.exports = {
  signUp
}