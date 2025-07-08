const nodeService = require('../services/node.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const createNode = async (req, res, next) => {
  const createNode = await nodeService.createNode(req.body);
  new SucessReponse({
    metaData: createNode
  }).send(res)
};
const getAllNodes = async (req, res, next) => {
  const allNodes = await nodeService.getAllNode(req.user);
  new SucessReponse({
    message: 'get all nodes thành công!',
    metaData: allNodes
  }).send(res)
}
const editNode = async (req, res, next) => {
  const data = await nodeService.editNode(req.body);
  new SucessReponse({
    message: 'get all nodes thành công!',
    metaData: data
  }).send(res)
}
const deleteNode = async (req, res, next) => {
  const data = await nodeService.deleteNode(req.params);
  new SucessReponse({
    message: 'get all nodes thành công!',
    metaData: data
  }).send(res)
}
module.exports = {
  createNode,
  getAllNodes,
  editNode,
  deleteNode
}