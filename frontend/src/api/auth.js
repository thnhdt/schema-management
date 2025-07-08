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
  const response = await api.post('/user/logout', undefined);
  store.dispatch({ type: 'user/logout' });
  sessionStorage.removeItem('userId');
  return response.data;
};

export const signUp = async (createdData) => {
  const response = await api.post(`/user/signup`, createdData, { requiresAuth: true });
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/user/refresh-token', {}, { withCredentials: true });
  const newToken = response.data?.metaData?.tokens?.accessToken;

  if (newToken) {
    const state = store.getState();
    const userId = state.user.userId;
    const username = state.user.username;
    const roles = state.user.roles;
    store.dispatch({
      type: 'user/setCredentials',
      payload: { token: newToken, roles, userId, username },
    });
  }

  return response.data;
};

export const getState = async (userId) => {
  const response = await api.get(`/user/get-state`, {
    params: { userId },
    requiresAuth: true,
  });
  return response.data;
}