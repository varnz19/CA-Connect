import { api } from './api';
import { DocumentRequest } from '../types';
import axios from 'axios';

export const documentService = {
  getDocumentRequests: async (): Promise<{ data: DocumentRequest[] }> => {
    const response = await api.get('/documents');
    return response.data;
  },

  getDocumentRequest: async (id: string): Promise<{ data: DocumentRequest }> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  createDocumentRequest: async (requestData: any): Promise<{ data: DocumentRequest }> => {
    const response = await api.post('/documents', requestData);
    return response.data;
  },

  approveDocument: async (id: string, comment?: string): Promise<{ data: DocumentRequest }> => {
    const response = await api.put(`/documents/${id}/approve`, { comment });
    return response.data;
  },

  rejectDocument: async (id: string, comment: string): Promise<{ data: DocumentRequest }> => {
    const response = await api.put(`/documents/${id}/reject`, { comment });
    return response.data;
  },

  uploadDocument: async (id: string, fileUri: string, fileName: string, fileType: string, rawFile?: any): Promise<any> => {
    const formData = new FormData();
    if (rawFile) {
      formData.append('file', rawFile);
    } else {
      // @ts-ignore
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });
    }

    const response = await api.post(`/documents/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocumentRequest: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
