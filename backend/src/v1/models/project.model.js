const mongoose = require("mongoose");


const { Schema, model } = mongoose

const DATABASE_NAME = 'Project'
const COLLECTION_NAME = 'Projects'
// Declare the Schema of the Mongo model
const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    databaseId: {
        type: Array,
        default: []
    },
    tablePrefix: {
        type: Array,
        default: []
    },
    functionPrefix: {
        type: Array,
        default: []
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
module.exports = model(DATABASE_NAME, projectSchema);