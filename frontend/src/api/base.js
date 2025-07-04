import axios from 'axios';
import { store } from '../store';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;
    const userId = state.user.userId;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userId) {
      config.headers['userid'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(prom => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  queue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.requiresAuth
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              original.headers.Authorization = token;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/refresh-token`, null, { withCredentials: true });
        const newToken = res.data.metaData.tokens.accessToken;
        const state = store.getState();
        const userId = state.user.userId;
        if (userId) sessionStorage.setItem('userId', userId);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err);
        store.dispatch({ type: 'user/logout' });
        window.location.replace('/');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    else if (error.response?.status === 403) {
      setTimeout(() => {
        store.dispatch({ type: 'user/logout' });
        window.location.replace('/');
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default api; 