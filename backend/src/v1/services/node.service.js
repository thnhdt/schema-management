const nodeModel = require('../models/node.model');
const databaseModel = require('../models/database.model');
const mongoose = require('mongoose');
const { BadResponseError } = require('../cores/error.response');
const createNode = async (dataCreated) => {
  const checkNameAlready = await nodeModel.find({ name: dataCreated.name });
  if (checkNameAlready.length > 0) throw new BadResponseError('Tên Node đã tồn tại!');
  const newNode = await nodeModel.create(dataCreated);
  return {
    code: 201,
    metaData: {
      node: newNode
    }
  }
}
const getAllNode = async () => {
  const allNodes = await nodeModel.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'Databases',        // Tên collection trong MongoDB (viết thường, dạng plural)
        localField: '_id',
        foreignField: 'nodeId',
        as: 'databases'
      }
    }
  ]);
  return {
    code: 200,
    metaData: {
      node: allNodes
    }
  }
}
const editNode = async (reqBody) => {
  const { id, updateData } = reqBody;
  const targetUpdateData = await nodeModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, updateData, { new: true });
  return {
    code: 200,
    metaData: {
      data: targetUpdateData
    }
  }
}
const deleteNode = async (reqParams) => {
  const { id } = reqParams;
  const targetData = await nodeModel.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
  await databaseModel.deleteMany({ nodeId: new mongoose.Types.ObjectId(id) });
  return {
    code: 200,
    metaData: {
      data: targetData
    }
  }
}
module.exports = {
  createNode,
  getAllNode,
  editNode,
  deleteNode
}