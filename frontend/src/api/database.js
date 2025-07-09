import api from './base';

export const connectToDatabase = async (connectionConfig) => {
  const response = await api.post('/database/connect-database', connectionConfig, { requiresAuth: true });
  return response.data;
};

export const disconnectToDatabase = async (connectionConfig) => {
  const response = await api.post('/database/disconnect-database', connectionConfig, { requiresAuth: true });
  return response.data;
};

export const getAllDatabaseInHost = async (idHost, status) => {
  const response = await api.get('/database/get-all-databases', {
    params: { idHost, status },
    requiresAuth: true
  });
  return response.data;
};

export const createDatabase = async (createdData) => {
  const response = await api.post(`/database/create-database`, createdData, { requiresAuth: true });
  return response.data;
};

export const editDatabase = async (id, updateData) => {
  const response = await api.put(`/database`, { id, updateData }, { requiresAuth: true });
  return response.data;
};

export const deleteDatabase = async (id) => {
  const response = await api.delete(`/database/${id}`, { requiresAuth: true });
  return response.data;
};

export const getAllDatabasesAll = async () => {
  const response = await api.get('/database/get-all-databases-all', { requiresAuth: true });
  return response.data;
}; 