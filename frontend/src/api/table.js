import api from './base';

export const getTables = async (schema, id) => {
  const response = await api.get(`/table/get-all-tables`, { params: { schema, id }, requiresAuth: true });
  return response.data;
};

export const getAllDdlText = async (schema, id) => {
  const response = await api.get(`/table/get-ddl-text`, { params: { schema, id }, requiresAuth: true });
  return response.data;
};

export const dropTable = async (schema, id, tableName) => {
  const response = await api.post('/table/drop-table', { id, tableName, schema }, { requiresAuth: true });
  return response.data;
};

export const dropColumn = async (id, tableName, columnName, schema = 'public') => {
  const response = await api.post('/table/drop-column', { id, tableName, columnName, schema }, { requiresAuth: true });
  return response.data;
};

export const deleteRow = async (id, tableName, where, schema = 'public') => {
  const response = await api.post('/table/delete-row', { id, tableName, where, schema }, { requiresAuth: true });
  return response.data;
};

export const getColumns = async (id, tableName, schema = 'public') => {
  const response = await api.get('/table/get-columns', { params: { id, tableName, schema }, requiresAuth: true });
  return response.data;
};

export const getAllUpdateTables = async (targetDatabaseId, currentDatabaseId, tablePrefixes) => {
  const response = await api.post('/table/all-update-tables', { currentDatabaseId, targetDatabaseId, listTablePriority: tablePrefixes }, { requiresAuth: true });
  return response.data;
};

export const syncDatabase = async (targetDatabaseId, currentDatabaseId, allUpdateFunction, allUpdateDdlTable) => {
  const response = await api.post('/table/sync-database', {
    targetDatabaseId,
    currentDatabaseId,
    allUpdateFunction,
    allUpdateDdlTable
  }, { requiresAuth: true });
  return response.data;
};

export const getAllUpdateDdl = async (targetDatabaseId, currentDatabaseId) => {
  const response = await api.post('/table/all-update-ddl', {
    targetDatabaseId,
    currentDatabaseId
  }, { requiresAuth: true });
  return response.data;
};

export const saveDBHistory = async (databaseId) => {
  const response = await api.post('/table/save-DB-history', { databaseId }, { requiresAuth: true });
  return response.data;
};  