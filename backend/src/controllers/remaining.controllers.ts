import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { uploadFile } from '../utils/s3';
import { emailService } from '../services/email.service';

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
      let clientProfileId = req.body.clientProfileId;

      // If client is booking, resolve or create their clientProfile
      if (!clientProfileId && req.user?.role === 'CLIENT') {
        let profile = await prisma.clientProfile.findUnique({
          where: { userId: req.user.id },
          include: { user: true },
        });
        if (!profile) {
          const user = await prisma.user.findUnique({ where: { id: req.user.id } });
          const profileCount = await prisma.clientProfile.count();
          profile = await prisma.clientProfile.create({
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
      } else if (clientProfileId) {
        // Resolve profile if clientProfileId might be a userId
        let profile = await prisma.clientProfile.findUnique({
          where: { id: clientProfileId },
        });
        if (!profile) {
          profile = await prisma.clientProfile.findUnique({
            where: { userId: clientProfileId },
          });
          if (profile) clientProfileId = profile.id;
        }
      }

      if (!clientProfileId) {
        throw new AppError('Client account is required to schedule a consultation', 400);
      }

      const requestedDate = req.body.requestedDate ? new Date(req.body.requestedDate) : new Date();

      const apt = await prisma.appointment.create({
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

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'APPOINTMENT_BOOKED',
          entity: 'Appointment',
          entityId: apt.id,
        },
      });

      // NOTIFY THEM:
      if (req.user?.role === 'CLIENT') {
        // Client booked -> notify admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        const clientName = apt.clientProfile?.user
          ? `${apt.clientProfile.user.firstName} ${apt.clientProfile.user.lastName}`
          : 'A client';
        const dateStr = requestedDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        for (const admin of admins) {
          try {
            await prisma.notification.create({
              data: {
                userId: admin.id,
                type: 'APPOINTMENT_BOOKED',
                title: `New Consultation Request: ${apt.title}`,
                body: `${clientName} requested an advisory meeting for ${dateStr}.`,
                data: { appointmentId: apt.id, requestedDate: apt.requestedDate },
              },
            });
          } catch (e) {
            console.error('Failed to create admin notification:', e);
          }
        }
      } else {
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
            await prisma.notification.create({
              data: {
                userId: clientUser.id,
                type: 'APPOINTMENT_CONFIRMED',
                title: `Advisory Consultation Scheduled: ${apt.title}`,
                body: `Your CA practice partner has scheduled an advisory meeting for ${dateStr}.${apt.meetingLink ? ` Link: ${apt.meetingLink}` : ''}`,
                data: { appointmentId: apt.id, meetingLink: apt.meetingLink, date: apt.requestedDate },
              },
            });
          } catch (e) {
            console.error('Failed to create client notification:', e);
          }

          if (clientUser.email && apt.meetingLink) {
            emailService.sendAppointmentNotification(
              clientUser.email,
              `${clientUser.firstName} ${clientUser.lastName}`,
              apt.title,
              dateStr,
              apt.meetingLink,
              apt.notes || undefined
            ).catch((err) => console.error('Failed to send appointment email:', err));
          }
        }
      }

      res.status(201).json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  confirmAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const confirmedDate = req.body.confirmedDate ? new Date(req.body.confirmedDate) : new Date();
      const randPart = (n: number) => Math.random().toString(36).substring(2, 2 + n);
      const meetingLink =
        req.body.meetingLink ||
        `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;

      const apt = await prisma.appointment.update({
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

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
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
          await prisma.notification.create({
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
        } catch (notifErr) {
          console.error('Failed to notify client in-app:', notifErr);
        }

        if (clientUser.email) {
          emailService.sendAppointmentNotification(
            clientUser.email,
            `${clientUser.firstName} ${clientUser.lastName}`,
            apt.title,
            formattedDate,
            meetingLink,
            apt.notes || 'Please join the meeting link 5 minutes prior to the scheduled slot.'
          ).catch((e) => console.error('Failed to send appointment email:', e));
        }
      }

      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  rejectAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apt = await prisma.appointment.update({
        where: { id: req.params.id },
        data: { status: 'REJECTED', cancelledReason: req.body.reason },
        include: { clientProfile: { include: { user: true } } },
      });

      if (apt.clientProfile?.user?.id) {
        try {
          await prisma.notification.create({
            data: {
              userId: apt.clientProfile.user.id,
              type: 'APPOINTMENT_REJECTED',
              title: `Consultation Declined: ${apt.title}`,
              body: `Your requested session could not be scheduled: ${req.body.reason || 'Scheduling conflict. Please pick another slot.'}`,
              data: { appointmentId: apt.id },
            },
          });
        } catch (e) {
          console.error('Failed to notify client on rejection:', e);
        }
      }

      res.json({ success: true, data: apt });
    } catch (error) { next(error); }
  };

  rescheduleAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const confirmedDate = new Date(req.body.newDate);
      const apt = await prisma.appointment.update({
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
          await prisma.notification.create({
            data: {
              userId: clientUser.id,
              type: 'APPOINTMENT_CONFIRMED',
              title: `Meeting Rescheduled: ${apt.title}`,
              body: `Your advisory session has been moved to ${formattedDate}.${apt.meetingLink ? ` Link: ${apt.meetingLink}` : ''}`,
              data: { appointmentId: apt.id, meetingLink: apt.meetingLink, confirmedDate: apt.confirmedDate },
            },
          });
        } catch (e) {
          console.error('Failed to notify client on reschedule:', e);
        }

        if (clientUser.email && apt.meetingLink) {
          emailService.sendAppointmentNotification(
            clientUser.email,
            `${clientUser.firstName} ${clientUser.lastName}`,
            `[Rescheduled] ${apt.title}`,
            formattedDate,
            apt.meetingLink,
            apt.notes || undefined
          ).catch((e) => console.error('Failed to send reschedule email:', e));
        }
      }

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
