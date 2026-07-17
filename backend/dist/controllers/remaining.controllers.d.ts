import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class DocumentController {
    getDocumentRequests: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getDocumentRequest: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    createDocumentRequest: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    approveDocument: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    rejectDocument: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    uploadDocument: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteDocumentRequest: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
export declare class AppointmentController {
    getAppointments: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getAppointment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    createAppointment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    confirmAppointment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    rejectAppointment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    rescheduleAppointment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    cancelAppointment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    completeAppointment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
export declare class MessageController {
    getConversations: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getMessages: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    sendMessage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    markAsRead: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
export declare class NotificationController {
    getNotifications: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    markAsRead: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    markAllAsRead: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
export declare class ProfileController {
    getProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    changePassword: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
export declare class CalendarController {
    getEvents: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    createEvent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    updateEvent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteEvent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=remaining.controllers.d.ts.map