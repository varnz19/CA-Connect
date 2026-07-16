import { api } from './api';

export const calendarService = {
  getEvents: async (): Promise<any> => {
    const response = await api.get('/calendar');
    return response.data;
  },

  createEvent: async (eventData: any): Promise<any> => {
    const response = await api.post('/calendar', eventData);
    return response.data;
  },

  updateEvent: async (id: string, updates: any): Promise<any> => {
    const response = await api.put(`/calendar/${id}`, updates);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<any> => {
    const response = await api.delete(`/calendar/${id}`);
    return response.data;
  },
};
