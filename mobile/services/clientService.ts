import { api } from './api';
import { User } from '../types';

export const clientService = {
  getClients: async (search?: string, page = 1, limit = 20): Promise<{ data: User[]; total: number }> => {
    const params = { search, page, limit };
    const response = await api.get('/clients', { params });
    return response.data;
  },

  getClient: async (id: string): Promise<{ data: User }> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData: any): Promise<{ data: User }> => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  updateClient: async (id: string, updates: any): Promise<{ data: User }> => {
    const response = await api.put(`/clients/${id}`, updates);
    return response.data;
  },

  deleteClient: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};
