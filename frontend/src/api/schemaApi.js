import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

const schemaApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token nếu có
schemaApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Database connection
export const testDatabaseConnection = async (connectionConfig) => {
  try {
    const response = await schemaApi.post('/schema/test-connection', connectionConfig);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const connectToDatabase = async (connectionConfig) => {
  try {
    const response = await schemaApi.post('/schema/connect', connectionConfig);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Schema operations
export const getSchemas = async () => {
  try {
    const response = await schemaApi.get('/schema/schemas');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTables = async (schemaName) => {
  try {
    const response = await schemaApi.get(`/schema/tables/${schemaName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTableColumns = async (schemaName, tableName) => {
  try {
    const response = await schemaApi.get(`/schema/columns/${schemaName}/${tableName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTableRelationships = async (schemaName, tableName) => {
  try {
    const response = await schemaApi.get(`/schema/relationships/${schemaName}/${tableName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Table operations
export const createTable = async (schemaName, tableData) => {
  try {
    const response = await schemaApi.post(`/schema/tables/${schemaName}`, tableData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTable = async (schemaName, tableName, tableData) => {
  try {
    const response = await schemaApi.put(`/schema/tables/${schemaName}/${tableName}`, tableData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteTable = async (schemaName, tableName) => {
  try {
    const response = await schemaApi.delete(`/schema/tables/${schemaName}/${tableName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Column operations
export const addColumn = async (schemaName, tableName, columnData) => {
  try {
    const response = await schemaApi.post(`/schema/columns/${schemaName}/${tableName}`, columnData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateColumn = async (schemaName, tableName, columnName, columnData) => {
  try {
    const response = await schemaApi.put(`/schema/columns/${schemaName}/${tableName}/${columnName}`, columnData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteColumn = async (schemaName, tableName, columnName) => {
  try {
    const response = await schemaApi.delete(`/schema/columns/${schemaName}/${tableName}/${columnName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Relationship operations
export const createRelationship = async (relationshipData) => {
  try {
    const response = await schemaApi.post('/schema/relationships', relationshipData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteRelationship = async (relationshipId) => {
  try {
    const response = await schemaApi.delete(`/schema/relationships/${relationshipId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export schema
export const exportSchema = async (schemaName, format = 'sql') => {
  try {
    const response = await schemaApi.get(`/schema/export/${schemaName}`, {
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
    const response = await schemaApi.post('/schema/import', schemaData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default schemaApi; 