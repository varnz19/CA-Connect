import { api } from './api';
import { User } from '../types';

export const profileService = {
  getProfile: async (): Promise<{ data: User }> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<{ data: User }> => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData: any): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  },
};
