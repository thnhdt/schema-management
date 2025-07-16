import api from './base';

export const getAllLogs = async () => {
  const response = await api.get('/log/error', { requireAuth: true });
  return response.data;
}