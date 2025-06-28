const mongoose = require("mongoose");


const { Schema, model } = mongoose

const DATABASE_NAME = 'User'
const COLLECTION_NAME = 'Users'
// Declare the Schema of the Mongo model
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 150
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  roles: {
    type: Array,
    default: []
  }
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

//Export the model
module.exports = model(DATABASE_NAME, userSchema);