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

export async function forgetPassword(email) {
  const response = await api.post('user/forget-password', { email });
  return response.data;
}

export async function resetPassword(token, newPassword) {
  const response = await api.post('user/reset-password', { token, newPassword });
  return response.data;
}

export const getAllRoles = async () => {
  const response = await api.get('/user/get-all-roles', { requiresAuth: true });
  return response.data;
};

export const createRoles = async (data) => {
  const response = await api.post('/user/create-role', data, { requiresAuth: true });
  return response.data;
}; 

// export const createRoles = async () => {
//   const response = await api.get('/user/create-role', { requiresAuth: true });
//   return response.data;
// }; 