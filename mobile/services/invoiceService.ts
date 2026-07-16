import { api } from './api';
import { Invoice } from '../types';

export const invoiceService = {
  getInvoices: async (status?: string): Promise<{ data: Invoice[] }> => {
    const response = await api.get('/invoices', { params: { status } });
    return response.data;
  },

  getInvoice: async (id: string): Promise<{ data: Invoice }> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoiceData: any): Promise<{ data: Invoice }> => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  sendInvoice: async (id: string): Promise<{ data: Invoice }> => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  },

  updateInvoice: async (id: string, updates: any): Promise<{ data: Invoice }> => {
    const response = await api.put(`/invoices/${id}`, updates);
    return response.data;
  },

  markPaid: async (id: string): Promise<{ data: Invoice }> => {
    const response = await api.put(`/invoices/${id}/mark-paid`);
    return response.data;
  },

  deleteInvoice: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
};
