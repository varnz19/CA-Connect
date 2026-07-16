import { api } from './api';
import { Service } from '../types';

export const serviceService = {
  getServices: async (): Promise<{ data: Service[] }> => {
    const response = await api.get('/services');
    return response.data;
  },

  getService: async (id: string): Promise<{ data: Service }> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  createService: async (serviceData: any): Promise<{ data: Service }> => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  updateService: async (id: string, updates: any): Promise<{ data: Service }> => {
    const response = await api.put(`/services/${id}`, updates);
    return response.data;
  },

  deleteService: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};
