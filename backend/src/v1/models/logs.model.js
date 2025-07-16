const mongoose = require("mongoose");
const { Schema, model } = mongoose

const DATABASE_NAME = 'Log'
const COLLECTION_NAME = 'Logs'
// Declare the Schema of the Mongo model
const logSchema = new Schema({
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});


//Export the model
module.exports = model(DATABASE_NAME, logSchema);