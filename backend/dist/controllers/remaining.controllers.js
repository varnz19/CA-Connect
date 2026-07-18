"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = exports.ProfileController = exports.NotificationController = exports.MessageController = exports.AppointmentController = exports.DocumentController = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const s3_1 = require("../utils/s3");
class DocumentController {
    constructor() {
        this.getDocumentRequests = async (req, res, next) => {
            try {
                const where = req.user?.role === 'CLIENT' ? { clientProfile: { userId: req.user.id } } : {};
                const docs = await prisma_1.prisma.documentRequest.findMany({
                    where,
                    include: { documents: true, clientProfile: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
                    orderBy: { createdAt: 'desc' },
                });
                res.json({ success: true, data: docs });
            }
            catch (error) {
                next(error);
            }
        };
        this.getDocumentRequest = async (req, res, next) => {
            try {
                const doc = await prisma_1.prisma.documentRequest.findUnique({
                    where: { id: req.params.id },
                    include: { documents: true, clientProfile: { include: { user: true } } },
                });
                if (!doc)
                    throw new errorHandler_1.AppError('Document request not found', 404);
                res.json({ success: true, data: doc });
            }
            catch (error) {
                next(error);
            }
        };
        this.createDocumentRequest = async (req, res, next) => {
            try {
                const doc = await prisma_1.prisma.documentRequest.create({ data: req.body, include: { documents: true } });
                res.status(201).json({ success: true, data: doc });
            }
            catch (error) {
                next(error);
            }
        };
        this.approveDocument = async (req, res, next) => {
            try {
                const doc = await prisma_1.prisma.documentRequest.update({
                    where: { id: req.params.id },
                    data: { status: 'APPROVED', adminComment: req.body.comment || null },
                });
                await prisma_1.prisma.auditLog.create({ data: { userId: req.user.id, action: 'DOCUMENT_APPROVED', entity: 'DocumentRequest', entityId: doc.id } });
                res.json({ success: true, data: doc });
            }
            catch (error) {
                next(error);
            }
        };
        this.rejectDocument = async (req, res, next) => {
            try {
                const doc = await prisma_1.prisma.documentRequest.update({
                    where: { id: req.params.id },
                    data: { status: 'REJECTED', adminComment: req.body.comment },
                });
                await prisma_1.prisma.auditLog.create({ data: { userId: req.user.id, action: 'DOCUMENT_REJECTED', entity: 'DocumentRequest', entityId: doc.id } });
                res.json({ success: true, data: doc });
            }
            catch (error) {
                next(error);
            }
        };
        this.uploadDocument = async (req, res, next) => {
            try {
                if (!req.file) {
                    throw new errorHandler_1.AppError('No file uploaded', 400);
                }
                const { fileUrl } = await (0, s3_1.uploadFile)(req.file);
                const doc = await prisma_1.prisma.documentRequest.update({
                    where: { id: req.params.id },
                    data: {
                        status: 'UPLOADED',
                        documents: {
                            create: {
                                fileName: req.file.originalname,
                                fileUrl,
                                fileType: req.file.mimetype,
                                fileSize: req.file.size,
                            },
                        },
                    },
                    include: { documents: true },
                });
                res.json({ success: true, data: doc, message: 'Document uploaded successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteDocumentRequest = async (req, res, next) => {
            try {
                await prisma_1.prisma.documentRequest.delete({ where: { id: req.params.id } });
                res.json({ success: true, message: 'Document request deleted' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.DocumentController = DocumentController;
class AppointmentController {
    constructor() {
        this.getAppointments = async (req, res, next) => {
            try {
                const where = req.user?.role === 'CLIENT' ? { clientProfile: { userId: req.user.id } } : {};
                const appointments = await prisma_1.prisma.appointment.findMany({
                    where,
                    include: { clientProfile: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
                    orderBy: { requestedDate: 'asc' },
                });
                res.json({ success: true, data: appointments });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.findUnique({ where: { id: req.params.id }, include: { clientProfile: { include: { user: true } } } });
                if (!apt)
                    throw new errorHandler_1.AppError('Appointment not found', 404);
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.createAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.create({ data: { ...req.body, requestedDate: new Date(req.body.requestedDate) } });
                await prisma_1.prisma.auditLog.create({ data: { userId: req.user.id, action: 'APPOINTMENT_BOOKED', entity: 'Appointment', entityId: apt.id } });
                res.status(201).json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.confirmAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'CONFIRMED', confirmedDate: req.body.confirmedDate ? new Date(req.body.confirmedDate) : new Date() } });
                await prisma_1.prisma.auditLog.create({ data: { userId: req.user.id, action: 'APPOINTMENT_UPDATED', entity: 'Appointment', entityId: apt.id } });
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.rejectAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'REJECTED', cancelledReason: req.body.reason } });
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.rescheduleAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'RESCHEDULED', confirmedDate: new Date(req.body.newDate), notes: req.body.notes } });
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'CANCELLED', cancelledReason: req.body.reason } });
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.completeAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } });
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AppointmentController = AppointmentController;
class MessageController {
    constructor() {
        this.getConversations = async (req, res, next) => {
            try {
                if (req.user?.role === 'CLIENT') {
                    const clientProfile = await prisma_1.prisma.clientProfile.findUnique({
                        where: { userId: req.user.id }
                    });
                    if (clientProfile) {
                        const exists = await prisma_1.prisma.conversation.findUnique({
                            where: { clientProfileId: clientProfile.id }
                        });
                        if (!exists) {
                            await prisma_1.prisma.conversation.create({
                                data: { clientProfileId: clientProfile.id }
                            });
                        }
                    }
                }
                else if (req.user?.role === 'ADMIN') {
                    const clientProfiles = await prisma_1.prisma.clientProfile.findMany();
                    for (const cp of clientProfiles) {
                        const exists = await prisma_1.prisma.conversation.findUnique({
                            where: { clientProfileId: cp.id }
                        });
                        if (!exists) {
                            await prisma_1.prisma.conversation.create({
                                data: { clientProfileId: cp.id }
                            });
                        }
                    }
                }
                const where = req.user?.role === 'CLIENT' ? { clientProfile: { userId: req.user.id } } : {};
                const conversations = await prisma_1.prisma.conversation.findMany({
                    where,
                    include: {
                        clientProfile: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    },
                    orderBy: { lastMessageAt: 'desc' },
                });
                res.json({ success: true, data: conversations });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMessages = async (req, res, next) => {
            try {
                const messages = await prisma_1.prisma.message.findMany({
                    where: { conversationId: req.params.conversationId },
                    include: { sender: { select: { id: true, firstName: true, lastName: true } } },
                    orderBy: { createdAt: 'asc' },
                });
                res.json({ success: true, data: messages });
            }
            catch (error) {
                next(error);
            }
        };
        this.sendMessage = async (req, res, next) => {
            try {
                const { conversationId, receiverId, content, fileUrl, fileName, fileType } = req.body;
                const message = await prisma_1.prisma.message.create({
                    data: { conversationId, senderId: req.user.id, receiverId, content, fileUrl, fileName, fileType },
                    include: { sender: { select: { id: true, firstName: true, lastName: true } } },
                });
                await prisma_1.prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });
                await prisma_1.prisma.auditLog.create({ data: { userId: req.user.id, action: 'MESSAGE_SENT', entity: 'Message', entityId: message.id } });
                res.status(201).json({ success: true, data: message });
            }
            catch (error) {
                next(error);
            }
        };
        this.markAsRead = async (req, res, next) => {
            try {
                const msg = await prisma_1.prisma.message.update({ where: { id: req.params.messageId }, data: { readAt: new Date() } });
                res.json({ success: true, data: msg });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.MessageController = MessageController;
class NotificationController {
    constructor() {
        this.getNotifications = async (req, res, next) => {
            try {
                const notifications = await prisma_1.prisma.notification.findMany({
                    where: { userId: req.user.id },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                });
                res.json({ success: true, data: notifications });
            }
            catch (error) {
                next(error);
            }
        };
        this.markAsRead = async (req, res, next) => {
            try {
                const notif = await prisma_1.prisma.notification.update({ where: { id: req.params.id, userId: req.user.id }, data: { readAt: new Date() } });
                res.json({ success: true, data: notif });
            }
            catch (error) {
                next(error);
            }
        };
        this.markAllAsRead = async (req, res, next) => {
            try {
                await prisma_1.prisma.notification.updateMany({ where: { userId: req.user.id, readAt: null }, data: { readAt: new Date() } });
                res.json({ success: true, message: 'All notifications marked as read' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.NotificationController = NotificationController;
class ProfileController {
    constructor() {
        this.getProfile = async (req, res, next) => {
            try {
                const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id }, include: { clientProfile: true } });
                if (!user)
                    throw new errorHandler_1.AppError('User not found', 404);
                const { password, refreshToken, ...safeUser } = user;
                res.json({ success: true, data: safeUser });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProfile = async (req, res, next) => {
            try {
                const { firmName, panNumber, gstin, gstState, address, ...userFields } = req.body;
                const user = await prisma_1.prisma.user.update({
                    where: { id: req.user.id },
                    data: {
                        ...userFields,
                        clientProfile: req.user?.role === 'CLIENT' ? { update: { firmName, panNumber, gstin, gstState, address } } : undefined,
                    },
                    include: { clientProfile: true },
                });
                const { password, refreshToken, ...safeUser } = user;
                res.json({ success: true, data: safeUser });
            }
            catch (error) {
                next(error);
            }
        };
        this.changePassword = async (req, res, next) => {
            try {
                const { currentPassword, newPassword } = req.body;
                const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
                if (!user)
                    throw new errorHandler_1.AppError('User not found', 404);
                if (!user.password) {
                    throw new errorHandler_1.AppError('This account is configured for Google Login and does not have a local password.', 400);
                }
                const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
                const isValid = await bcrypt.compare(currentPassword, user.password);
                if (!isValid)
                    throw new errorHandler_1.AppError('Current password is incorrect', 400);
                const hashed = await bcrypt.hash(newPassword, 12);
                await prisma_1.prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
                await prisma_1.prisma.auditLog.create({ data: { userId: req.user.id, action: 'PASSWORD_CHANGED', entity: 'User', entityId: req.user.id } });
                res.json({ success: true, message: 'Password changed successfully' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ProfileController = ProfileController;
class CalendarController {
    constructor() {
        this.getEvents = async (req, res, next) => {
            try {
                const events = await prisma_1.prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } });
                res.json({ success: true, data: events });
            }
            catch (error) {
                next(error);
            }
        };
        this.createEvent = async (req, res, next) => {
            try {
                const event = await prisma_1.prisma.calendarEvent.create({ data: { ...req.body, date: new Date(req.body.date) } });
                res.status(201).json({ success: true, data: event });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateEvent = async (req, res, next) => {
            try {
                const event = await prisma_1.prisma.calendarEvent.update({ where: { id: req.params.id }, data: req.body });
                res.json({ success: true, data: event });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteEvent = async (req, res, next) => {
            try {
                await prisma_1.prisma.calendarEvent.delete({ where: { id: req.params.id } });
                res.json({ success: true, message: 'Event deleted' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CalendarController = CalendarController;
//# sourceMappingURL=remaining.controllers.js.map