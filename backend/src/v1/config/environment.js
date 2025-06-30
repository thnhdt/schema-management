require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  FRONTEND_URL: process.env.FRONTEND_URL,
  SECRET_KEY: process.env.SECRET_KEY,
  SALT: process.env.SALT
}