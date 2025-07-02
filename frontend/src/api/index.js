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
    return Promise.reject(error);
  }
);


export const testDatabaseConnection = async (connectionConfig) => {
  try {
    const response = await api.post('/schema/test-connection', connectionConfig);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const connectToDatabase = async (connectionConfig) => {
  try {
    const response = await api.post('/database/connect-database', connectionConfig, { requiresAuth: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const disconnectToDatabase = async (connectionConfig) => {
  try {
    const response = await api.post('/database/disconnect-database', connectionConfig, { requiresAuth: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTables = async (schema, id) => {
  try {
    const response = await api.get(`/table/get-all-tables`, { params: { schema, id }, requiresAuth: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getAllDdlText = async (schema, id) => {
  const response = await api.get(`/table/get-ddl-text`, { params: { schema: schema, id }, requiresAuth: true });
  return response.data;
}


export const getAllUsers = async () => {
  const response = await api.get('/user/get-all-users', { requiresAuth: true });
  return response.data;
}

export const getAllDatabaseInHost = async (idHost, status) => {
  const response = await api.get('/database/get-all-databases', {
    params: { idHost, status },      // query string
    requiresAuth: true       // flag cho interceptor
  });
  return response.data;
}

export const login = async (email, password) => {
  const response = await api.post('/user/login', { email, password });
  return response.data
}
export const logout = async () => {
  const response = await api.post('/user/logout', undefined, { requiresAuth: true });
  return response.data;
}
export const getAllNodes = async () => {
  const response = await api.get('/node/get-all-nodes', { requiresAuth: true });
  return response.data;
}
export const getAllFunctions = async (schema, id) => {
  const response = await api.get('/function/get-all-functions', { params: { schema, id }, requiresAuth: true });
  return response.data;
}
export const getAllSequences = async (schema, id) => {
  const response = await api.get('/sequence/get-all-sequences', { params: { schema, id }, requiresAuth: true });
  return response.data;
}

export const createNode = async (nodeData) => {
  const response = await api.post('/node/create-node', nodeData, {
    requiresAuth: true,
  });
  return response.data;
}

export const editNode = async (id, updateData) => {
  const response = await api.put('/node', { id: id, updateData }, {
    requiresAuth: true,
  });
  return response.data;
}


export const deleteNode = async (id) => {
  const response = await api.delete(`/node/${id}`, {
    requiresAuth: true,
  });
  return response.data;
}

export const editDatabase = async (id, updateData) => {
  const response = await api.put(`/database`, { id, updateData }, {
    requiresAuth: true,
  });
  return response.data;
}
export const deleteDatabase = async (id) => {
  const response = await api.delete(`/database/${id}`, {
    requiresAuth: true,
  });
  return response.data;
}

export const createDatabase = async (createdData) => {
  const response = await api.post(`/database/create-database`, createdData, {
    requiresAuth: true,
  });
  return response.data;
}
export const getState = async (userId) => {
  console.log('getState called with', userId);
  const response = await api.get(`/user/get-state`, {
    params: { userId },
    requiresAuth: true,
  });
  return response.data;
}
export const signUp = async (createdData) => {
  const response = await api.post(`/user/signup`, createdData, {
    requiresAuth: true,
  });
  return response.data;
}
export default api; 
