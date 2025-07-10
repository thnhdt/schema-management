const nodeModel = require('../models/node.model');
const databaseModel = require('../models/database.model');
const mongoose = require('mongoose');
const { BadResponseError } = require('../cores/error.response');
const createNode = async (dataCreated) => {
  const { name, host, port, databaseInfo } = dataCreated;
  const checkNodeAlready = await nodeModel.find({ host, port });
  if (checkNodeAlready.length > 0) throw new BadResponseError('Node đã tồn tại!');
  const newNode = await nodeModel.create({ name, host, port });

  if (databaseInfo && databaseInfo.username && databaseInfo.password && databaseInfo.database) {
    await databaseModel.create({
      nodeId: newNode._id,
      name: databaseInfo.database,
      username: databaseInfo.username,
      password: databaseInfo.password,
      database: databaseInfo.database,
      status: 'inactive'
    });
  }

  return {
    code: 201,
    metaData: {
      node: newNode
    }
  }
}
const getAllNode = async (user) => {
  let allNodes = [];
  const permissionsDB = user.userPermissions;
  if (user.isAdmin) {
    allNodes = await nodeModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'Databases',
          localField: '_id',
          foreignField: 'nodeId',
          as: 'databases'
        }
      }
    ]);
  }
  else {
    const dbIdSet = new Set(
      permissionsDB.flatMap(role =>
        role.permissions
          .filter(p => p.databaseId)
          .map(p => String(p.databaseId))
      )
    );
    const dbIds = [...dbIdSet].map(id =>
      mongoose.isValidObjectId(id) && typeof id === 'string'
        ? new mongoose.Types.ObjectId(id)
        : id
    );
    console.log(dbIds);
    allNodes = await nodeModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'Databases',
          let: { nodeId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$nodeId', '$$nodeId'] },
                    { $in: ['$_id', dbIds] }
                  ]
                }
              }
            }
          ],
          as: 'databases'
        }
      },
      { $match: { 'databases.0': { $exists: true } } }
    ]);
  }


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