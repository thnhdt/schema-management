const nodeModel = require('../models/node.model');
const { BadResponseError } = require('../cores/error.response');
const createNode = async (dataCreated) => {
  const checkNameAlready = await nodeModel.find({ name: dataCreated.name });
  if (checkNameAlready) throw new BadResponseError('Tên Node đã tồn tại!');
  const newNode = await nodeModel.create(dataCreated);
  return {
    code: 201,
    metaData: {
      node: newNode
    }
  }
}
const getAllNode = async () => {
  const allNodes = await nodeModel.find({}).sort({ createdAt: -1 }).lean();
  return {
    code: 200,
    metaData: {
      node: allNodes
    }
  }
}
module.exports = {
  createNode,
  getAllNode
}