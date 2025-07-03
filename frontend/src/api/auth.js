import api from './base';

export const login = async (email, password) => {
  const response = await api.post('/user/login', { email, password });
  const user = response.data?.metaData?.metaData?.user;
  if (user && Array.isArray(user.roles)) {
    sessionStorage.setItem('roles', JSON.stringify(user.roles));
  } else {
    sessionStorage.removeItem('roles');
  }
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/user/logout', undefined, { requiresAuth: true });
  return response.data;
};

export const signUp = async (createdData) => {
  const response = await api.post(`/user/signup`, createdData, { requiresAuth: true });
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/user/refresh-token', null, { withCredentials: true });
  return response.data;
};

export const getState = async (userId) => {
  console.log('getState called with', userId);
  const response = await api.get(`/user/get-state`, {
    params: { userId },
    requiresAuth: true,
  });
  return response.data;
}