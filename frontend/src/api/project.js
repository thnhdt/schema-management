import api from './base';

export const getAllProject = async () => {
  const response = await api.get('/project/get-all-project', {requiresAuth: true });
  return response.data;
};

export const dropProject = async (_id) => {
  const response = await api.delete('/project/drop-project', { data: { _id }, requiresAuth: true });
  return response.data;
};

export const createProject = async (data) => {
    const response = await api.post('/project/create-project', data, { requiresAuth: true });
    return response.data;
  };

export const editProject = async (data) => {
    console.log(data);
  const response = await api.patch('/project/edit-project', data, { requiresAuth: true });
  return response.data;
}