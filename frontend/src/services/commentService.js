import api from './api';

export const getComments = async (documentId) => {
  const response = await api.get(`/comments/${documentId}`);
  return response.data;
};

export const addComment = async (data) => {
  // data: { documentId, comment }
  const response = await api.post('/comments', data);
  return response.data;
};
