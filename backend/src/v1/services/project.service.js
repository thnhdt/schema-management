const { crossOriginResourcePolicy } = require('helmet');
const { BadResponseError } = require('../cores/error.response');
const projectModel = require('../models/project.model');
const mongoose = require('mongoose');

const getAllProject = async () => {
    return result = await projectModel.find({}).sort({ createdAt: -1 }).lean()
}

const createProject = async (dataCreate) => {
    const {name} = dataCreate;
    const checkName = await projectModel.findOne({name}).lean();
    if(checkName){
        throw new BadResponseError("Error: Name is exist! ")
    }
    const newProject = await projectModel.create({...dataCreate});
    return {
        code: 200,
        metaData: newProject
      }
}

const dropProject = async (_id) => {
    console.log(_id);
    if (!_id) throw new BadResponseError('Missing Project id');
    const deleted = await projectModel.findByIdAndDelete(_id).lean();
    if (!deleted) throw new BadResponseError('Project not found');
    return deleted;
}

const editProject = async (reqBody) => {
    const { _id, updateData } = reqBody;
    console.log(updateData);
    const updateProject = await projectModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(_id) }, updateData, { new: true });
    return {
      code: 200,
      metaData: {
        data: updateProject
      }
    }
  }

const getPrefixes = async (projectId) => {
    if (!projectId) throw new BadResponseError('Missing projectId');
    const project = await projectModel.findById(projectId).lean();
    if (!project) return { tablePrefix: [], functionPrefix: [] };
    return {
        tablePrefix: Array.isArray(project.tablePrefix) ? project.tablePrefix : [],
        functionPrefix: Array.isArray(project.functionPrefix) ? project.functionPrefix : []
    };
}

module.exports = {
  getAllProject,
  createProject,
  dropProject,
  editProject,
  getPrefixes
}