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
const email_service_1 = require("../services/email.service");
const socket_service_1 = require("../services/socket.service");
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
                const { clientProfileId, name } = req.body;
                // Prevent duplicate submissions within 15 seconds for identical document name and client
                if (clientProfileId && name) {
                    const recentDuplicate = await prisma_1.prisma.documentRequest.findFirst({
                        where: {
                            clientProfileId,
                            name,
                            createdAt: { gte: new Date(Date.now() - 15000) },
                        },
                        include: { documents: true },
                    });
                    if (recentDuplicate) {
                        res.status(200).json({ success: true, data: recentDuplicate });
                        return;
                    }
                }
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
                let clientProfileId = req.body.clientProfileId;
                // If client is booking, resolve or create their clientProfile
                if (!clientProfileId && req.user?.role === 'CLIENT') {
                    let profile = await prisma_1.prisma.clientProfile.findUnique({
                        where: { userId: req.user.id },
                        include: { user: true },
                    });
                    if (!profile) {
                        const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
                        const profileCount = await prisma_1.prisma.clientProfile.count();
                        profile = await prisma_1.prisma.clientProfile.create({
                            data: {
                                userId: req.user.id,
                                clientCode: `CAC-${String(profileCount + 1).padStart(3, '0')}`,
                                firmName: user ? `${user.firstName} ${user.lastName}` : 'Client Account',
                                adminId: 'admin',
                            },
                            include: { user: true },
                        });
                    }
                    clientProfileId = profile.id;
                }
                else if (clientProfileId) {
                    // Resolve profile if clientProfileId might be a userId
                    let profile = await prisma_1.prisma.clientProfile.findUnique({
                        where: { id: clientProfileId },
                    });
                    if (!profile) {
                        profile = await prisma_1.prisma.clientProfile.findUnique({
                            where: { userId: clientProfileId },
                        });
                        if (profile)
                            clientProfileId = profile.id;
                    }
                }
                if (!clientProfileId) {
                    throw new errorHandler_1.AppError('Client account is required to schedule a consultation', 400);
                }
                const requestedDate = req.body.requestedDate ? new Date(req.body.requestedDate) : new Date();
                const apt = await prisma_1.prisma.appointment.create({
                    data: {
                        clientProfileId,
                        title: req.body.title || 'Advisory Consultation',
                        description: req.body.description || null,
                        requestedDate,
                        duration: req.body.duration ? Number(req.body.duration) : 60,
                        notes: req.body.notes || null,
                        meetingLink: req.body.meetingLink || null,
                    },
                    include: {
                        clientProfile: {
                            include: { user: true },
                        },
                    },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'APPOINTMENT_BOOKED',
                        entity: 'Appointment',
                        entityId: apt.id,
                    },
                });
                // NOTIFY CA ADMIN:
                if (apt.status === 'REQUESTED' || req.user?.role === 'CLIENT') {
                    // Client booked -> notify admins
                    const admins = await prisma_1.prisma.user.findMany({ where: { role: 'ADMIN' } });
                    const clientName = apt.clientProfile?.user
                        ? `${apt.clientProfile.user.firstName} ${apt.clientProfile.user.lastName}`
                        : apt.clientProfile?.firmName || 'Client';
                    const dateStr = requestedDate.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    for (const admin of admins) {
                        try {
                            await prisma_1.prisma.notification.create({
                                data: {
                                    userId: admin.id,
                                    type: 'APPOINTMENT_BOOKED',
                                    title: `New Consultation Request: ${apt.title}`,
                                    body: `${clientName} requested an advisory consultation for ${dateStr}.`,
                                    data: { appointmentId: apt.id, requestedDate: apt.requestedDate, clientName },
                                },
                            });
                        }
                        catch (e) {
                            console.error('Failed to create admin notification:', e);
                        }
                    }
                }
                else {
                    // Admin scheduled -> notify client
                    if (apt.clientProfile?.user?.id) {
                        const clientUser = apt.clientProfile.user;
                        const dateStr = requestedDate.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                        try {
                            await prisma_1.prisma.notification.create({
                                data: {
                                    userId: clientUser.id,
                                    type: 'APPOINTMENT_CONFIRMED',
                                    title: `Advisory Consultation Scheduled: ${apt.title}`,
                                    body: `Your CA practice partner has scheduled an advisory meeting for ${dateStr}.${apt.meetingLink ? ` Link: ${apt.meetingLink}` : ''}`,
                                    data: { appointmentId: apt.id, meetingLink: apt.meetingLink, date: apt.requestedDate },
                                },
                            });
                        }
                        catch (e) {
                            console.error('Failed to create client notification:', e);
                        }
                        if (clientUser.email && apt.meetingLink) {
                            email_service_1.emailService.sendAppointmentNotification(clientUser.email, `${clientUser.firstName} ${clientUser.lastName}`, apt.title, dateStr, apt.meetingLink, apt.notes || undefined).catch((err) => console.error('Failed to send appointment email:', err));
                        }
                    }
                }
                res.status(201).json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.confirmAppointment = async (req, res, next) => {
            try {
                const confirmedDate = req.body.confirmedDate ? new Date(req.body.confirmedDate) : new Date();
                const randPart = (n) => Math.random().toString(36).substring(2, 2 + n);
                const meetingLink = req.body.meetingLink ||
                    `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
                const apt = await prisma_1.prisma.appointment.update({
                    where: { id: req.params.id },
                    data: {
                        status: 'CONFIRMED',
                        confirmedDate,
                        meetingLink,
                        notes: req.body.notes || null,
                    },
                    include: {
                        clientProfile: {
                            include: { user: true },
                        },
                    },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'APPOINTMENT_UPDATED',
                        entity: 'Appointment',
                        entityId: apt.id,
                    },
                });
                // NOTIFY THE CLIENT:
                if (apt.clientProfile?.user?.id) {
                    const clientUser = apt.clientProfile.user;
                    const formattedDate = confirmedDate.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    try {
                        await prisma_1.prisma.notification.create({
                            data: {
                                userId: clientUser.id,
                                type: 'APPOINTMENT_CONFIRMED',
                                title: `Meeting Confirmed: ${apt.title}`,
                                body: `Your advisory session is confirmed for ${formattedDate}. Google Meet link: ${meetingLink}`,
                                data: {
                                    appointmentId: apt.id,
                                    meetingLink,
                                    confirmedDate: apt.confirmedDate,
                                },
                            },
                        });
                    }
                    catch (notifErr) {
                        console.error('Failed to notify client in-app:', notifErr);
                    }
                    if (clientUser.email) {
                        email_service_1.emailService.sendAppointmentNotification(clientUser.email, `${clientUser.firstName} ${clientUser.lastName}`, apt.title, formattedDate, meetingLink, apt.notes || 'Please join the meeting link 5 minutes prior to the scheduled slot.').catch((e) => console.error('Failed to send appointment email:', e));
                    }
                }
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.rejectAppointment = async (req, res, next) => {
            try {
                const apt = await prisma_1.prisma.appointment.update({
                    where: { id: req.params.id },
                    data: { status: 'REJECTED', cancelledReason: req.body.reason },
                    include: { clientProfile: { include: { user: true } } },
                });
                if (apt.clientProfile?.user?.id) {
                    try {
                        await prisma_1.prisma.notification.create({
                            data: {
                                userId: apt.clientProfile.user.id,
                                type: 'APPOINTMENT_REJECTED',
                                title: `Consultation Declined: ${apt.title}`,
                                body: `Your requested session could not be scheduled: ${req.body.reason || 'Scheduling conflict. Please pick another slot.'}`,
                                data: { appointmentId: apt.id },
                            },
                        });
                    }
                    catch (e) {
                        console.error('Failed to notify client on rejection:', e);
                    }
                }
                res.json({ success: true, data: apt });
            }
            catch (error) {
                next(error);
            }
        };
        this.rescheduleAppointment = async (req, res, next) => {
            try {
                const confirmedDate = new Date(req.body.newDate);
                const apt = await prisma_1.prisma.appointment.update({
                    where: { id: req.params.id },
                    data: {
                        status: 'RESCHEDULED',
                        confirmedDate,
                        notes: req.body.notes,
                        meetingLink: req.body.meetingLink || null,
                    },
                    include: { clientProfile: { include: { user: true } } },
                });
                if (apt.clientProfile?.user?.id) {
                    const clientUser = apt.clientProfile.user;
                    const formattedDate = confirmedDate.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    try {
                        await prisma_1.prisma.notification.create({
                            data: {
                                userId: clientUser.id,
                                type: 'APPOINTMENT_CONFIRMED',
                                title: `Meeting Rescheduled: ${apt.title}`,
                                body: `Your advisory session has been moved to ${formattedDate}.${apt.meetingLink ? ` Link: ${apt.meetingLink}` : ''}`,
                                data: { appointmentId: apt.id, meetingLink: apt.meetingLink, confirmedDate: apt.confirmedDate },
                            },
                        });
                    }
                    catch (e) {
                        console.error('Failed to notify client on reschedule:', e);
                    }
                    if (clientUser.email && apt.meetingLink) {
                        email_service_1.emailService.sendAppointmentNotification(clientUser.email, `${clientUser.firstName} ${clientUser.lastName}`, `[Rescheduled] ${apt.title}`, formattedDate, apt.meetingLink, apt.notes || undefined).catch((e) => console.error('Failed to send reschedule email:', e));
                    }
                }
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
                const adminUser = await prisma_1.prisma.user.findFirst({
                    where: { role: 'ADMIN' },
                    select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
                });
                const defaultAdminId = adminUser ? adminUser.id : '';
                if (req.user?.role === 'CLIENT') {
                    let clientProfile = await prisma_1.prisma.clientProfile.findUnique({
                        where: { userId: req.user.id }
                    });
                    if (!clientProfile) {
                        const profileCount = await prisma_1.prisma.clientProfile.count();
                        const currentUser = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
                        const firmName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Client Firm' : 'Client Firm';
                        clientProfile = await prisma_1.prisma.clientProfile.create({
                            data: {
                                userId: req.user.id,
                                clientCode: `CAC${(profileCount + 1).toString().padStart(4, '0')}`,
                                firmName,
                                adminId: defaultAdminId,
                            }
                        });
                    }
                    await prisma_1.prisma.conversation.upsert({
                        where: { clientProfileId: clientProfile.id },
                        update: {},
                        create: { clientProfileId: clientProfile.id }
                    });
                }
                else if (req.user?.role === 'ADMIN') {
                    const clientUsers = await prisma_1.prisma.user.findMany({
                        where: { role: 'CLIENT' },
                        include: { clientProfile: true }
                    });
                    for (const cu of clientUsers) {
                        let cp = cu.clientProfile;
                        if (!cp) {
                            const count = await prisma_1.prisma.clientProfile.count();
                            cp = await prisma_1.prisma.clientProfile.create({
                                data: {
                                    userId: cu.id,
                                    clientCode: `CAC${(count + 1).toString().padStart(4, '0')}`,
                                    firmName: `${cu.firstName || ''} ${cu.lastName || ''}`.trim() || 'Client Firm',
                                    adminId: defaultAdminId,
                                }
                            });
                        }
                        await prisma_1.prisma.conversation.upsert({
                            where: { clientProfileId: cp.id },
                            update: {},
                            create: { clientProfileId: cp.id }
                        });
                    }
                }
                const where = req.user?.role === 'CLIENT' ? { clientProfile: { userId: req.user.id } } : {};
                const rawConversations = await prisma_1.prisma.conversation.findMany({
                    where,
                    include: {
                        clientProfile: {
                            include: {
                                user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } }
                            }
                        },
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    },
                    orderBy: { lastMessageAt: 'desc' },
                });
                const conversations = await Promise.all(rawConversations.map(async (conv) => {
                    const unreadCount = await prisma_1.prisma.message.count({
                        where: {
                            conversationId: conv.id,
                            receiverId: req.user.id,
                            readAt: null,
                        }
                    });
                    return {
                        ...conv,
                        unreadCount,
                        admin: adminUser,
                        client: conv.clientProfile?.user,
                    };
                }));
                res.json({ success: true, data: conversations });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOrCreateConversation = async (req, res, next) => {
            try {
                const targetClientId = req.user?.role === 'CLIENT'
                    ? req.user.id
                    : (req.params.clientId || req.body.clientId || req.user.id);
                const adminUser = await prisma_1.prisma.user.findFirst({
                    where: { role: 'ADMIN' },
                    select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
                });
                const defaultAdminId = adminUser ? adminUser.id : '';
                let clientProfile = await prisma_1.prisma.clientProfile.findUnique({
                    where: { userId: targetClientId }
                });
                if (!clientProfile) {
                    const count = await prisma_1.prisma.clientProfile.count();
                    const clientUser = await prisma_1.prisma.user.findUnique({ where: { id: targetClientId } });
                    const firmName = clientUser ? `${clientUser.firstName || ''} ${clientUser.lastName || ''}`.trim() || 'Client Firm' : 'Client Firm';
                    clientProfile = await prisma_1.prisma.clientProfile.create({
                        data: {
                            userId: targetClientId,
                            clientCode: `CAC${(count + 1).toString().padStart(4, '0')}`,
                            firmName,
                            adminId: defaultAdminId,
                        }
                    });
                }
                const conversation = await prisma_1.prisma.conversation.upsert({
                    where: { clientProfileId: clientProfile.id },
                    update: {},
                    create: { clientProfileId: clientProfile.id },
                    include: {
                        clientProfile: {
                            include: {
                                user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } }
                            }
                        },
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    },
                });
                res.json({
                    success: true,
                    data: {
                        ...conversation,
                        admin: adminUser,
                        client: conversation.clientProfile?.user,
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMessages = async (req, res, next) => {
            try {
                const { conversationId } = req.params;
                const conversation = await prisma_1.prisma.conversation.findUnique({
                    where: { id: conversationId },
                    include: { clientProfile: true }
                });
                if (!conversation) {
                    throw new errorHandler_1.AppError('Conversation not found', 404);
                }
                // ISOLATION: A client can ONLY access their own conversation!
                if (req.user?.role === 'CLIENT' && conversation.clientProfile.userId !== req.user.id) {
                    throw new errorHandler_1.AppError('Access denied: You can only view your own conversation', 403);
                }
                // Auto-mark messages as read for this receiver
                await prisma_1.prisma.message.updateMany({
                    where: {
                        conversationId,
                        receiverId: req.user.id,
                        readAt: null,
                    },
                    data: { readAt: new Date() },
                });
                const messages = await prisma_1.prisma.message.findMany({
                    where: { conversationId },
                    include: {
                        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                    },
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
                const { conversationId, content, fileUrl, fileName, fileType } = req.body;
                let { receiverId } = req.body;
                if (!conversationId) {
                    throw new errorHandler_1.AppError('conversationId is required', 400);
                }
                const conversation = await prisma_1.prisma.conversation.findUnique({
                    where: { id: conversationId },
                    include: { clientProfile: true }
                });
                if (!conversation) {
                    throw new errorHandler_1.AppError('Conversation not found', 404);
                }
                // STRICT USER & THREAD ISOLATION
                if (req.user?.role === 'CLIENT') {
                    // Client can only post in their own conversation
                    if (conversation.clientProfile.userId !== req.user.id) {
                        throw new errorHandler_1.AppError('Access denied: Cannot post in another user\'s conversation', 403);
                    }
                    // Receiver for client message is always the CA Admin
                    const adminUser = await prisma_1.prisma.user.findFirst({ where: { role: 'ADMIN' } });
                    if (!adminUser) {
                        throw new errorHandler_1.AppError('No CA Admin found to receive message', 404);
                    }
                    receiverId = adminUser.id;
                }
                else {
                    // Admin posting message: receiver is always the client of this conversation
                    receiverId = conversation.clientProfile.userId;
                }
                const message = await prisma_1.prisma.message.create({
                    data: {
                        conversationId,
                        senderId: req.user.id,
                        receiverId: receiverId,
                        content: content?.trim(),
                        fileUrl,
                        fileName,
                        fileType,
                    },
                    include: {
                        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                    },
                });
                await prisma_1.prisma.conversation.update({
                    where: { id: conversationId },
                    data: { lastMessageAt: new Date() }
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'MESSAGE_SENT',
                        entity: 'Message',
                        entityId: message.id
                    }
                });
                // Broadcast real-time message to conversation room and receiver user room
                (0, socket_service_1.broadcastNewMessage)(conversationId, receiverId, message);
                res.status(201).json({ success: true, data: message });
            }
            catch (error) {
                next(error);
            }
        };
        this.markAsRead = async (req, res, next) => {
            try {
                const msg = await prisma_1.prisma.message.update({
                    where: { id: req.params.messageId },
                    data: { readAt: new Date() }
                });
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