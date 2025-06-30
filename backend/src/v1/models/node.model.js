const mongoose = require("mongoose");


const { Schema, model } = mongoose

const DATABASE_NAME = 'Node'
const COLLECTION_NAME = 'Nodes'
// Declare the Schema of the Mongo model
const nodeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 150
  },
  host: {
    type: String,
    required: true,
    trim: true
  },
  port: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

//Export the model
module.exports = model(DATABASE_NAME, nodeSchema);