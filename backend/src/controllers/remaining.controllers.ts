import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { uploadFile } from '../utils/s3';

export class DocumentController {
  getDocumentRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const where = req.user?.role === 'CLIENT' ? { clientProfile: { userId: req.user.id } } : {};
      const docs = await prisma.documentRequest.findMany({
        where,
        include: { documents: true, clientProfile: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: docs });
    } catch (error) { next(error); }
  };

  getDocumentRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await prisma.documentRequest.findUnique({
        where: { id: req.params.id },
        include: { documents: true, clientProfile: { include: { user: true } } },
      });
      if (!doc) throw new AppError('Document request not found', 404);
      res.json({ success: true, data: doc });
    } catch (error) { next(error); }
  };

  createDocumentRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await prisma.documentRequest.create({ data: req.body, include: { documents: true } });
      res.status(201).json({ success: true, data: doc });
    } catch (error) { next(error); }
  };

  approveDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await prisma.documentRequest.update({
        where: { id: req.params.id },
        data: { status: 'APPROVED', adminComment: req.body.comment || null },
      });
      await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'DOCUMENT_APPROVED', entity: 'DocumentRequest', entityId: doc.id } });
      res.json({ success: true, data: doc });
    } catch (error) { next(error); }
  };

  rejectDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await prisma.documentRequest.update({
        where: { id: req.params.id },
        data: { status: 'REJECTED', adminComment: req.body.comment },
      });
      await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'DOCUMENT_REJECTED', entity: 'DocumentRequest', entityId: doc.id } });
      res.json({ success: true, data: doc });
    } catch (error) { next(error); }
  };

  uploadDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const { fileUrl } = await uploadFile(req.file);

      const doc = await prisma.documentRequest.update({
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
    } catch (error) { next(error); }
  };

  deleteDocumentRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.documentRequest.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Document request deleted' });
    } catch (error) { next(error); }
  };
}

export class AppointmentController {
  getAppointments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const where = req.user?.role === 'CLIENT' ? { clientProfile: { userId: req.user.id } } : {};
      const appointments = await prisma.appointment.findMany({
        where,
        include: { clientProfile: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
        orderBy: { requestedDate: 'asc' },
      });
      res.json({ success: true, data: appointments });
    } catch (error) { next(error); }
  };

  getAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.findUnique({ where: { id: req.params.id }, include: { clientProfile: { include: { user: true } } } });
      if (!apt) throw new AppError('Appointment not found', 404);
      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  createAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.create({ data: { ...req.body, requestedDate: new Date(req.body.requestedDate) } });
      await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'APPOINTMENT_BOOKED', entity: 'Appointment', entityId: apt.id } });
      res.status(201).json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  confirmAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.update({
        where: { id: req.params.id },
        data: {
          status: 'CONFIRMED',
          confirmedDate: req.body.confirmedDate ? new Date(req.body.confirmedDate) : new Date(),
          meetingLink: req.body.meetingLink || null,
          notes: req.body.notes || null,
        },
      });
      await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'APPOINTMENT_UPDATED', entity: 'Appointment', entityId: apt.id } });
      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  rejectAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'REJECTED', cancelledReason: req.body.reason } });
      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  rescheduleAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.update({
        where: { id: req.params.id },
        data: {
          status: 'RESCHEDULED',
          confirmedDate: new Date(req.body.newDate),
          notes: req.body.notes,
          meetingLink: req.body.meetingLink || null,
        },
      });
      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  cancelAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'CANCELLED', cancelledReason: req.body.reason } });
      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  completeAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } });
      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };
}

export class MessageController {
  getConversations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role === 'CLIENT') {
        const clientProfile = await prisma.clientProfile.findUnique({
          where: { userId: req.user.id }
        });
        if (clientProfile) {
          const exists = await prisma.conversation.findUnique({
            where: { clientProfileId: clientProfile.id }
          });
          if (!exists) {
            await prisma.conversation.create({
              data: { clientProfileId: clientProfile.id }
            });
          }
        }
      } else if (req.user?.role === 'ADMIN') {
        const clientProfiles = await prisma.clientProfile.findMany();
        for (const cp of clientProfiles) {
          const exists = await prisma.conversation.findUnique({
            where: { clientProfileId: cp.id }
          });
          if (!exists) {
            await prisma.conversation.create({
              data: { clientProfileId: cp.id }
            });
          }
        }
      }

      const where = req.user?.role === 'CLIENT' ? { clientProfile: { userId: req.user.id } } : {};
      const conversations = await prisma.conversation.findMany({
        where,
        include: {
          clientProfile: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
      res.json({ success: true, data: conversations });
    } catch (error) { next(error); }
  };

  getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messages = await prisma.message.findMany({
        where: { conversationId: req.params.conversationId },
        include: { sender: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'asc' },
      });
      res.json({ success: true, data: messages });
    } catch (error) { next(error); }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId, receiverId, content, fileUrl, fileName, fileType } = req.body;
      const message = await prisma.message.create({
        data: { conversationId, senderId: req.user!.id, receiverId, content, fileUrl, fileName, fileType },
        include: { sender: { select: { id: true, firstName: true, lastName: true } } },
      });
      await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });
      await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'MESSAGE_SENT', entity: 'Message', entityId: message.id } });
      res.status(201).json({ success: true, data: message });
    } catch (error) { next(error); }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const msg = await prisma.message.update({ where: { id: req.params.messageId }, data: { readAt: new Date() } });
      res.json({ success: true, data: msg });
    } catch (error) { next(error); }
  };
}

export class NotificationController {
  getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: notifications });
    } catch (error) { next(error); }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notif = await prisma.notification.update({ where: { id: req.params.id, userId: req.user!.id }, data: { readAt: new Date() } });
      res.json({ success: true, data: notif });
    } catch (error) { next(error); }
  };

  markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.notification.updateMany({ where: { userId: req.user!.id, readAt: null }, data: { readAt: new Date() } });
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
  };
}

export class ProfileController {
  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { clientProfile: true } });
      if (!user) throw new AppError('User not found', 404);
      const { password, refreshToken, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch (error) { next(error); }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { firmName, panNumber, gstin, gstState, address, ...userFields } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...userFields,
          clientProfile: req.user?.role === 'CLIENT' ? { update: { firmName, panNumber, gstin, gstState, address } } : undefined,
        },
        include: { clientProfile: true },
      });
      const { password, refreshToken, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch (error) { next(error); }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) throw new AppError('User not found', 404);
      if (!user.password) {
        throw new AppError('This account is configured for Google Login and does not have a local password.', 400);
      }
      const bcrypt = await import('bcryptjs');
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) throw new AppError('Current password is incorrect', 400);
      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } });
      await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'PASSWORD_CHANGED', entity: 'User', entityId: req.user!.id } });
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) { next(error); }
  };
}

export class CalendarController {
  getEvents = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const events = await prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } });
      res.json({ success: true, data: events });
    } catch (error) { next(error); }
  };

  createEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await prisma.calendarEvent.create({ data: { ...req.body, date: new Date(req.body.date) } });
      res.status(201).json({ success: true, data: event });
    } catch (error) { next(error); }
  };

  updateEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await prisma.calendarEvent.update({ where: { id: req.params.id }, data: req.body });
      res.json({ success: true, data: event });
    } catch (error) { next(error); }
  };

  deleteEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.calendarEvent.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Event deleted' });
    } catch (error) { next(error); }
  };
}
