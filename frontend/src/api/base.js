import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
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
        sessionStorage.setItem('token', newToken);
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err);
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        window.location.replace('/');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    else if (error.response?.status === 403) {
      setTimeout(() => {
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        window.location.replace('/');
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default api; 