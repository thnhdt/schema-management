const databaseModel = require('../models/database.model');
const nodeModel = require('../models/node.model');
const { BadResponseError, NotFoundError } = require('../cores/error.response');
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const POOLMAP = new Map();

setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  for (const [id, connection] of POOLMAP.entries()) {
    if (now - connection.lastUsed > fiveMinutes) {
      console.log(`Cleaning up old connection for database ${id}`);
      try {
        connection.sequelize.close();
      } catch (error) {
        console.log('Error closing old connection:', error.message);
      }
      POOLMAP.delete(id);
    }
  }
}, 5 * 60 * 1000);

const createPhysicalDB = async (dbName, username, password, host, port) => {
  const sequelize = new Sequelize('postgres', username, password, {
    host,
    port,
    dialect: 'postgres',
    logging: false,
  });
  const [results] = await sequelize.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
  if (results.length === 0) {
    await sequelize.query(`CREATE DATABASE "${dbName}"`);
  }
  await sequelize.close();
};

const createDatabase = async (dataCreated) => {
  const checkNameAlready = await databaseModel.find({ nodeId: new mongoose.Types.ObjectId(dataCreated.nodeId), name: dataCreated.name }).lean();
  if (checkNameAlready.length > 0) throw new BadResponseError('Tên Database đã tồn tại!');
  const node = await nodeModel.findById(dataCreated.nodeId).lean();
  if (!node) throw new BadResponseError('Node không tồn tại!');
  await createPhysicalDB(
    dataCreated.database,
    dataCreated.username,
    dataCreated.password,
    node.host,
    node.port
  );

  const dataCreate = {
    ...dataCreated,
    nodeId: new mongoose.Types.ObjectId(dataCreated.nodeId)
  }
  const newDatabase = await databaseModel.create(dataCreate);
  return {
    code: 201,
    metaData: {
      database: newDatabase
    }
  }
};
const getAllDatabaseInHost = async (reqQuery) => {
  const { idHost, status } = reqQuery;
  let allDatabase = [];
  if (status) {
    allDatabase = await databaseModel.find({ nodeId: new mongoose.Types.ObjectId(idHost), status: status }).lean();
  }
  else {
    allDatabase = await databaseModel.find({ nodeId: new mongoose.Types.ObjectId(idHost) }).lean();
  }
  return {
    code: 200,
    metaData: {
      database: allDatabase
    }
  }
};

const connectToDatabase = async (reqBody) => {
  const { id } = reqBody;
  const targetDatabase = await databaseModel.findById(id).lean();
  if (!targetDatabase) throw new NotFoundError("Không tồn tại database!");
  const targetNode = await nodeModel.findById(targetDatabase.nodeId).lean();
  if (!targetNode) throw new NotFoundError("Không tồn tại node!");
  if (POOLMAP.has(id)) {
    const poolConnection = POOLMAP.get(id);
    try {
      await poolConnection.sequelize.authenticate();
      poolConnection.lastUsed = Date.now();
      return poolConnection.sequelize;
    } catch (error) {
      console.log('Connection validation failed, removing from pool:', error.message);
      try {
        await poolConnection.sequelize.close();
      } catch (closeError) {
        console.log('Error closing invalid connection:', closeError.message);
      }
      POOLMAP.delete(id);
    }
  }
  
  const sequelize = new Sequelize(
    targetDatabase.database,
    targetDatabase.username,
    targetDatabase.password,
    {
      host: targetNode.host,
      port: Number(targetNode.port),
      dialect: 'postgres',
      pool: { 
        max: 5, 
        min: 0, 
        idle: 30000,
        acquire: 60000,
        evict: 30000
      },
      logging: false,
      retry: {
        max: 3,
        timeout: 10000
      }
    }
  );
  
  try {
    await sequelize.authenticate();
    POOLMAP.set(id, { sequelize, lastUsed: Date.now() });
    await databaseModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) }, 
      { status: 'active' }, 
      { new: true }
    );
    
    return sequelize;
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    throw new BadResponseError(`Không thể kết nối đến database: ${error.message}`);
  }
};

const connectToDatabaseForResponse = async (reqBody) => {
  const { id } = reqBody;
  const targetDatabase = await databaseModel.findById(id).lean();
  if (!targetDatabase) throw new NotFoundError("Không tồn tại database!");
  const targetNode = await nodeModel.findById(targetDatabase.nodeId).lean();
  if (!targetNode) throw new NotFoundError("Không tồn tại node!");
  
  const sequelize = new Sequelize(
    targetDatabase.database,
    targetDatabase.username,
    targetDatabase.password,
    {
      host: targetNode.host,
      port: Number(targetNode.port),
      dialect: 'postgres',
      pool: { max: 10, min: 0, idle: 10_000 },
      logging: false,
    }
  );
  await sequelize.authenticate();
  POOLMAP.set(id, { sequelize, lastUsed: Date.now() });
  const updateDatabase = await databaseModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) }, 
    { status: 'active' }, 
    { new: true }
  );
  
  return {
    code: 200,
    metaData: {
      message: "Connect thành công!",
      database: {
        id: updateDatabase._id,
        name: updateDatabase.database,
        host: targetNode.host,
        port: targetNode.port,
        status: updateDatabase.status
      }
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
const editDatabase = async (reqBody) => {
  const { id, updateData } = reqBody;
  const targetDatabase = await databaseModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, updateData, { new: true });
  return {
    code: 201,
    metaData: {
      database: targetDatabase
    }
  }
};
const deleteDatabase = async ({ id }) => {
  const targetDatabase = await databaseModel.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
  return {
    code: 201,
    metaData: {
      database: targetDatabase
    }
  }
}
process.on('SIGINT', async () => {
  await Promise.all([...POOLMAP.values()].map((p) => p.sequelize.close()));
  process.exit(0);
});
module.exports = {
  createDatabase,
  connectToDatabase,
  connectToDatabaseForResponse,
  disconnectDb, getAllDatabaseInHost,
  editDatabase,
  deleteDatabase,
  POOLMAP
}