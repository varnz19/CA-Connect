import { Server } from 'socket.io';
export declare const setupSocketIO: (io: Server) => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getSocketId: (userId: string) => string | undefined;
export declare const isUserOnline: (userId: string) => boolean;
export declare const sendNotificationToUser: (io: Server, userId: string, notification: object) => void;
export declare const broadcastNewMessage: (conversationId: string, receiverId: string, message: any) => void;
//# sourceMappingURL=socket.service.d.ts.map