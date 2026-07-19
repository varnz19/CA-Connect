import { api } from './api';
import { Appointment } from '../types';

export const appointmentService = {
  getAppointments: async (): Promise<{ data: Appointment[] }> => {
    const response = await api.get('/appointments');
    return response.data;
  },

  getAppointment: async (id: string): Promise<{ data: Appointment }> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (appointmentData: any): Promise<{ data: Appointment }> => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  confirmAppointment: async (id: string, payload: { confirmedDate?: string; meetingLink?: string; notes?: string }): Promise<{ data: Appointment }> => {
    const response = await api.put(`/appointments/${id}/confirm`, payload);
    return response.data;
  },

  rejectAppointment: async (id: string, reason?: string): Promise<{ data: Appointment }> => {
    const response = await api.put(`/appointments/${id}/reject`, { reason });
    return response.data;
  },

  rescheduleAppointment: async (id: string, payload: { newDate: string; notes?: string; meetingLink?: string }): Promise<{ data: Appointment }> => {
    const response = await api.put(`/appointments/${id}/reschedule`, payload);
    return response.data;
  },

  cancelAppointment: async (id: string, reason?: string): Promise<{ data: Appointment }> => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  completeAppointment: async (id: string): Promise<{ data: Appointment }> => {
    const response = await api.put(`/appointments/${id}/complete`);
    return response.data;
  },
};
