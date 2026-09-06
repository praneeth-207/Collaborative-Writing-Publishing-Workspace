import api from './api';

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const createDocument = async (data) => {
  // data: { title, content, workspaceId }
  const response = await api.post('/documents', data);
  return response.data;
};

export const updateDocument = async (id, data) => {
  // data: { title, content }
  const response = await api.put(`/documents/${id}`, data);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const togglePublish = async (id) => {
  const response = await api.post(`/documents/${id}/publish`);
  return response.data;
};
