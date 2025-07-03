import api from './base';

export const getAllSequences = async (schema, id) => {
  const response = await api.get('/sequence/get-all-sequences', { params: { schema, id }, requiresAuth: true });
  return response.data;
};

export const dropSequence = async (schema, id, sequenceName) => {
  const response = await api.post('/sequence/drop-sequence', { id, sequenceName, schema }, { requiresAuth: true });
  return response.data;
}; 