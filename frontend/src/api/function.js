import api from './base';

export const getAllFunctions = async (schema, id) => {
  const response = await api.get('/function/get-all-functions', { params: { schema, id }, requiresAuth: true });
  return response.data;
};

export const dropFunction = async (schema, id, functionName, args = '') => {
  const response = await api.post('/function/drop-function', { id, functionName, args, schema }, { requiresAuth: true });
  return response.data;
};

export const getAllUpdateFunction = async (targetDatabaseId, currentDatabaseId, functionPrefixes) => {
  const response = await api.post('/function/all-update-functions', { currentDatabaseId, targetDatabaseId, listPriorityFunction: functionPrefixes }, { requiresAuth: true });
  return response.data;
}