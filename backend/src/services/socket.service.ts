import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

let ioInstance: Server | null = null;
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const setupSocketIO = (io: Server) => {
  ioInstance = io;
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    try {
      const decoded = verifyAccessToken(token);
      (socket as Socket & { userId: string; userRole: string }).userId = decoded.id;
      (socket as Socket & { userId: string; userRole: string }).userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as Socket & { userId: string }).userId;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Track online users
    onlineUsers.set(userId, socket.id);
    io.emit('user:online', { userId });

    // Join personal room
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Handle message sending
    socket.on(
      'message:send',
      (data: { conversationId: string; receiverId: string; content?: string; fileUrl?: string; fileName?: string }) => {
        const payload = {
          ...data,
          senderId: userId,
          createdAt: new Date().toISOString(),
        };
        // Broadcast to receiver personal room and conversation room
        socket.to(`conversation:${data.conversationId}`).emit('message:receive', payload);
        socket.to(`user:${data.receiverId}`).emit('message:receive', payload);

        // Confirm delivery to sender
        socket.emit('message:delivered', { conversationId: data.conversationId });
      }
    );

    // Handle read receipts
    socket.on('message:read', (data: { conversationId: string; senderId: string }) => {
      socket.to(`user:${data.senderId}`).emit('message:read-receipt', {
        conversationId: data.conversationId,
        readAt: new Date().toISOString(),
      });
    });

    // Handle typing
    socket.on('typing:start', (data: { conversationId: string; receiverId: string }) => {
      socket.to(`user:${data.receiverId}`).emit('typing:start', { userId });
    });

    socket.on('typing:stop', (data: { conversationId: string; receiverId: string }) => {
      socket.to(`user:${data.receiverId}`).emit('typing:stop', { userId });
    });

    // Handle notifications
    socket.on('notification:send', (data: { receiverId: string; notification: object }) => {
      socket.to(`user:${data.receiverId}`).emit('notification:receive', data.notification);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId });
    });
  });

  return io;
};

export const getSocketId = (userId: string): string | undefined => {
  return onlineUsers.get(userId);
};

export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

export const sendNotificationToUser = (io: Server, userId: string, notification: object) => {
  io.to(`user:${userId}`).emit('notification:receive', notification);
};

export const broadcastNewMessage = (conversationId: string, receiverId: string, message: any) => {
  if (ioInstance) {
    ioInstance.to(`conversation:${conversationId}`).emit('message:receive', message);
    ioInstance.to(`user:${receiverId}`).emit('message:receive', message);
  }
};
