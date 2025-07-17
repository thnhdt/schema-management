const projectService = require('../services/project.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const getAllProject = async (req, res, next) => {
    const targetData = await projectService.getAllProject();
    new SucessReponse({
      metaData: targetData
    }).send(res)
};

const createProject = async (req, res, next) => {
    const targetData = await projectService.createProject(req.body);
    new SucessReponse({
      metaData: targetData
    }).send(res)
};


const dropProject = async (req, res, next) => {
    console.log(req.body);
  const result = await projectService.dropProject(req.body);
  new SucessReponse({ metaData: result }).send(res);
};

const editProject = async (req, res, next) => {
    const targetData = await projectService.editProject(req.body);
    new SucessReponse({
      metaData: targetData
    }).send(res)
};

const getPrefixes = async (req, res, next) => {
    const { projectId } = req.query;
    const result = await projectService.getPrefixes(projectId);
    new SucessReponse({
      metaData: result
    }).send(res)
};

module.exports = {
    getAllProject,
    createProject,
    dropProject,
    editProject,
    getPrefixes
}