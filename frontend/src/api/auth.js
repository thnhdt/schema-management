import api from './base';
import { store } from '../store';

export const login = async (email, password) => {
  const response = await api.post('/user/login', { email, password });
  const user = response.data?.metaData?.metaData?.user;
  const token = response.data?.metaData?.metaData?.tokens?.accessToken;
  const userId = user?.userId;
  const username = user?.name;
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  store.dispatch({
    type: 'user/setCredentials',
    payload: { token, roles, userId, username },
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/user/logout', undefined, { requiresAuth: true });
  store.dispatch({ type: 'user/logout' });
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