const mongoose = require("mongoose");


const { Schema, model } = mongoose

const DATABASE_NAME = 'Database'
const COLLECTION_NAME = 'Databases'
// Declare the Schema of the Mongo model
const databaseSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 150
  },
  nodeId: {
    type: mongoose.Types.ObjectId,
    ref: 'Nodes',
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'inactive',
    enum: ['active', 'inactive']
  },
  urlString: {
    type: String,
    required: true
  },
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

//Export the model
module.exports = model(DATABASE_NAME, databaseSchema);
