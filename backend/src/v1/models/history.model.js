const mongoose = require("mongoose");
const { Schema, model } = mongoose

const DATABASE_NAME = 'History'
const COLLECTION_NAME = 'History'
// Declare the Schema of the Mongo model
const VersionSchema = new Schema({
  timestamps:{
    type: Date,
    default: Date.now
  },
  tables:{
    type: Array,
    default: []
  },
  functions:{
    type: Array,
    default: []
  },
  // sequences:  {
  //   type: Array,
  //   default: []
  // }
}, { _id: false });

const historySchema = new Schema({
  databaseName: {
    type: mongoose.Types.ObjectId,
    ref: 'Nodes',
    required: true,
    trim: true
  },
  versions: [VersionSchema]
}, { 
  timestamps: true,
  collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DATABASE_NAME, historySchema);