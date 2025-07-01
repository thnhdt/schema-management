import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3051/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
        const res = await axios.post('http://localhost:3051/api/user/refresh-token', null, { withCredentials: true });
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
      }, 2000);
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
    const response = await api.post('/database/connect-database', connectionConfig, { auth: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const disconnectToDatabase = async (connectionConfig) => {
  try {
    const response = await api.post('/database/disconnect-database', connectionConfig);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
// Schema operations
export const getSchemas = async () => {
  try {
    const response = await api.get('/schema/schemas');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTables = async (schemaName, id) => {
  try {
    const response = await api.get(`/table/get-all-tables`, { params: { schema: schemaName, id } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getAllDdlText = async (schema, id) => {
  const response = await api.get(`/table/get-ddl-text`, { params: { schema: schema, id } });
  return response.data;
}

// export const getTableColumns = async (schemaName, tableName) => {
//   try {
//     const response = await api.get(`/table//${schemaName}/${tableName}`);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// export const getTableRelationships = async (schemaName, tableName) => {
//   try {
//     const response = await api.get(`/schema/relationships/${schemaName}/${tableName}`);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// Table operations
export const createTable = async (schemaName, tableData) => {
  try {
    const response = await api.post(`/schema/tables/${schemaName}`, tableData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTable = async (schemaName, tableName, tableData) => {
  try {
    const response = await api.put(`/schema/tables/${schemaName}/${tableName}`, tableData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteTable = async (schemaName, tableName) => {
  try {
    const response = await api.delete(`/schema/tables/${schemaName}/${tableName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Column operations
export const addColumn = async (schemaName, tableName, columnData) => {
  try {
    const response = await api.post(`/schema/columns/${schemaName}/${tableName}`, columnData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateColumn = async (schemaName, tableName, columnName, columnData) => {
  try {
    const response = await api.put(`/schema/columns/${schemaName}/${tableName}/${columnName}`, columnData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteColumn = async (schemaName, tableName, columnName) => {
  try {
    const response = await api.delete(`/schema/columns/${schemaName}/${tableName}/${columnName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Relationship operations
export const createRelationship = async (relationshipData) => {
  try {
    const response = await api.post('/schema/relationships', relationshipData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteRelationship = async (relationshipId) => {
  try {
    const response = await api.delete(`/schema/relationships/${relationshipId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export schema
export const exportSchema = async (schemaName, format = 'sql') => {
  try {
    const response = await api.get(`/schema/export/${schemaName}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Import schema
export const importSchema = async (schemaData) => {
  try {
    const response = await api.post('/schema/import', schemaData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getAllUsers = async () => {
  const response = await api.get('/user/get-all-users', { requiresAuth: true });
  return response.data;
}

export const getAllDatabaseInHost = async (idHost) => {
  console.log("idHost", idHost);
  const response = await api.get('/database/get-all-databases', {
    params: { idHost },      // query string
    requiresAuth: true       // flag cho interceptor
  });
  return response.data;
}

export const login = async (email, password) => {
  const response = await api.post('/user/login', { email, password });
  return response.data
}
export const logout = async () => {
  const response = await api.post('/user/logout', null, { requiresAuth: true });
  return response.data;
}
export const getAllNodes = async () => {
  const response = await api.get('/node/get-all-nodes', { requiresAuth: true });
  return response.data;
}
export default api; 
