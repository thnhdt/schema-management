import api from './base';

export const getAllNodes = async () => {
  const response = await api.get('/node/get-all-nodes', { requiresAuth: true });
  return response.data;
};

export const createNode = async (nodeData) => {
  const response = await api.post('/node/create-node', nodeData, { requiresAuth: true });
  return response.data;
};

export const editNode = async (id, updateData) => {
  const response = await api.put('/node', { id, updateData }, { requiresAuth: true });
  return response.data;
};

export const deleteNode = async (id) => {
  const response = await api.delete(`/node/${id}`, { requiresAuth: true });
  return response.data;
}; 