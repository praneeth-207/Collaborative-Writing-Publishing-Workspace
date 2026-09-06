import api from './api';

export const getWorkspaces = async () => {
  const response = await api.get('/workspaces');
  return response.data;
};

export const getWorkspace = async (id) => {
  const response = await api.get(`/workspaces/${id}`);
  return response.data;
};

export const createWorkspace = async (data) => {
  const response = await api.post('/workspaces', data);
  return response.data;
};

export const getWorkspaceDocuments = async (id) => {
  const response = await api.get(`/workspaces/${id}/documents`);
  return response.data;
};

export const getWorkspaceLogs = async (id) => {
  const response = await api.get(`/workspaces/${id}/logs`);
  return response.data;
};

export const manageMembers = async (id, data) => {
  // data: { email, action: 'add' | 'remove', role: 'owner' | 'editor' | 'viewer' }
  const response = await api.post(`/workspaces/${id}/members`, data);
  return response.data;
};
