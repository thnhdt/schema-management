const mongoose = require("mongoose");


const { Schema, model } = mongoose

const DATABASE_NAME = 'Role'
const COLLECTION_NAME = 'Roles'
// Declare the Schema of the Mongo model
//permisson có dạng [
// {idDatabase , ops:[enum: [select : 1, create: 2, update-table:2, update-funciton:2]]}
// ]
// Viết hàm check role ở từng quyền 
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 150
  },
  permissions: {
    type: Array,
    default: []
  },
  isCreate: { type: Boolean, default: false }
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

//Export the model
module.exports = model(DATABASE_NAME, userSchema);