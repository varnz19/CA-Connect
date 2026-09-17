import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { Platform } from 'react-native';

const getSocketUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }
  return 'http://localhost:4000';
};

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) return;

    if (this.socket?.connected) return;

    this.socket = io(getSocketUrl(), {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚡ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('⚡ Socket connection warning:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('⚡ Socket connection closed');
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('conversation:join', conversationId);
      console.log(`⚡ Socket joined conversation room: ${conversationId}`);
    }
  }

  sendMessage(data: {
    conversationId: string;
    receiverId: string;
    content?: string;
    fileUrl?: string;
    fileName?: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('message:send', data);
    }
  }

  onReceiveMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message:receive', callback);
    }
    return () => {
      this.socket?.off('message:receive', callback);
    };
  }

  onMessageDelivered(callback: (data: { conversationId: string }) => void) {
    if (this.socket) {
      this.socket.on('message:delivered', callback);
    }
    return () => {
      this.socket?.off('message:delivered', callback);
    };
  }

  onMessageRead(callback: (data: { conversationId: string; readAt: string }) => void) {
    if (this.socket) {
      this.socket.on('message:read-receipt', callback);
    }
    return () => {
      this.socket?.off('message:read-receipt', callback);
    };
  }

  emitTypingStart(conversationId: string, receiverId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', { conversationId, receiverId });
    }
  }

  emitTypingStop(conversationId: string, receiverId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', { conversationId, receiverId });
    }
  }

  onTypingStart(callback: (data: { userId: string }) => void) {
    if (this.socket) {
      this.socket.on('typing:start', callback);
    }
    return () => {
      this.socket?.off('typing:start', callback);
    };
  }

  onTypingStop(callback: (data: { userId: string }) => void) {
    if (this.socket) {
      this.socket.on('typing:stop', callback);
    }
    return () => {
      this.socket?.off('typing:stop', callback);
    };
  }

  onNotificationReceive(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification:receive', callback);
    }
    return () => {
      this.socket?.off('notification:receive', callback);
    };
  }
}

export const socketService = new SocketService();
