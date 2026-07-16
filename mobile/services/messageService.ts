import { api } from './api';
import { Conversation, Message } from '../types';

export const messageService = {
  getConversations: async (): Promise<{ data: Conversation[] }> => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<{ data: Message[] }> => {
    const response = await api.get(`/messages/conversations/${conversationId}`);
    return response.data;
  },

  sendMessage: async (messageData: {
    conversationId: string;
    receiverId: string;
    content?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
  }): Promise<{ data: Message }> => {
    const response = await api.post('/messages/send', messageData);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<{ data: Message }> => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },
};
