import api from './base';

export const getAllUsers = async () => {
  const response = await api.get('/user/get-all-users', { requiresAuth: true });
  return response.data;
};

export const updateUser = async (updateData) => {
  const response = await api.patch(`/user/update-user`, updateData, { requiresAuth: true });
  return response.data;
};

export const deleteUser = async (_id) => {
  const response = await api.delete('/user/delete-user', { data: { _id }, requiresAuth: true });
  return response.data;
}; 