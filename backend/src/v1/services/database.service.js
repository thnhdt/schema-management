const databaseModel = require('../models/database.model');
const nodeModel = require('../models/node.model');
const { BadResponseError, NotFoundError } = require('../cores/error.response');
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const POOLMAP = new Map();

const createDatabase = async (dataCreated) => {
  const checkNameAlready = await databaseModel.find({ name: dataCreated.name });
  if (checkNameAlready) throw new BadResponseError('Tên Node đã tồn tại!');
  const newDatabase = await databaseModel.create(dataCreated);
  return {
    code: 201,
    metaData: {
      database: newDatabase
    }
  }
};
const getAllDatabaseInHost = async (reqQuery) => {
  const { idHost, status } = reqQuery;
  const allDatabase = await databaseModel.find({ nodeId: new mongoose.Types.ObjectId(idHost), status: status }).lean();
  return {
    code: 200,
    metaData: {
      database: allDatabase
    }
  }
};

const connectToDatabase = async (reqBody) => {
  const { id } = reqBody;
  const targetDatabase = await databaseModel.findById(id);
  if (!targetDatabase) throw new NotFoundError("Không tồn tại database!");
  const sequelize = new Sequelize(targetDatabase.urlString, {
    pool: { max: 10, min: 0, idle: 10_000 },
    dialect: 'postgres',
    logging: false,
  });
  await sequelize.authenticate();
  await POOLMAP.set(id, { sequelize, lastUsed: Date.now() });
  const updateDatabase = await databaseModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { status: 'active' }, { new: true });
  return {
    code: 200,
    metaData: {
      message: "Connect thành công!",
      updateData: updateDatabase
    }
  }
};
const disconnectDb = async (reqBody) => {
  const { id } = reqBody;
  if (!POOLMAP.has(id)) throw new BadResponseError("Seqencelize chưa được kết nối !")
  await POOLMAP.get(id).sequelize.close();
  await POOLMAP.delete(id);
  const updateTarget = await databaseModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { status: 'inactive' }, { new: true });
  return {
    code: 200,
    metaData: {
      message: "Disconnect thành công!",
      updateBool: updateTarget
    }
  };
}
/* graceful shutdown */
process.on('SIGINT', async () => {
  await Promise.all([...POOLS.values()].map((p) => p.sequelize.close()));
  process.exit(0);
});
module.exports = {
  createDatabase,
  connectToDatabase,
  disconnectDb, getAllDatabaseInHost,
  POOLMAP
}