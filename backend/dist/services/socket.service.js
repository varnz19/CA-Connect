"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNewMessage = exports.sendNotificationToUser = exports.isUserOnline = exports.getSocketId = exports.setupSocketIO = void 0;
const jwt_1 = require("../utils/jwt");
let ioInstance = null;
const onlineUsers = new Map(); // userId -> socketId
const setupSocketIO = (io) => {
    ioInstance = io;
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId} (${socket.id})`);
        // Track online users
        onlineUsers.set(userId, socket.id);
        io.emit('user:online', { userId });
        // Join personal room
        socket.join(`user:${userId}`);
        // Join conversation room
        socket.on('conversation:join', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });
        // Handle message sending
        socket.on('message:send', (data) => {
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
        });
        // Handle read receipts
        socket.on('message:read', (data) => {
            socket.to(`user:${data.senderId}`).emit('message:read-receipt', {
                conversationId: data.conversationId,
                readAt: new Date().toISOString(),
            });
        });
        // Handle typing
        socket.on('typing:start', (data) => {
            socket.to(`user:${data.receiverId}`).emit('typing:start', { userId });
        });
        socket.on('typing:stop', (data) => {
            socket.to(`user:${data.receiverId}`).emit('typing:stop', { userId });
        });
        // Handle notifications
        socket.on('notification:send', (data) => {
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
exports.setupSocketIO = setupSocketIO;
const getSocketId = (userId) => {
    return onlineUsers.get(userId);
};
exports.getSocketId = getSocketId;
const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
const sendNotificationToUser = (io, userId, notification) => {
    io.to(`user:${userId}`).emit('notification:receive', notification);
};
exports.sendNotificationToUser = sendNotificationToUser;
const broadcastNewMessage = (conversationId, receiverId, message) => {
    if (ioInstance) {
        ioInstance.to(`conversation:${conversationId}`).emit('message:receive', message);
        ioInstance.to(`user:${receiverId}`).emit('message:receive', message);
    }
};
exports.broadcastNewMessage = broadcastNewMessage;
//# sourceMappingURL=socket.service.js.map