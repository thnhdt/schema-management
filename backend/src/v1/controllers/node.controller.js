const nodeService = require('../services/node.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const createNode = async (req, res, next) => {
  const createNode = await nodeService.createNode(req.body);
  new SucessReponse({
    metaData: createNode
  }).send(res)
};
const getAllNodes = async (req, res, next) => {
  const allNodes = await nodeService.getAllNode();
  new SucessReponse({
    message: 'get all nodes thành công!',
    metaData: allNodes
  }).send(res)
}
module.exports = {
  createNode,
  getAllNodes
}