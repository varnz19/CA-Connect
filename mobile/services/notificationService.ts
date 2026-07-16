import { api } from './api';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<{ data: Notification[] }> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<{ data: Notification }> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};
