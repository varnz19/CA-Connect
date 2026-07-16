import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const createClientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  firmName: z.string().optional(),
  panNumber: z.string().optional(),
  gstin: z.string().optional(),
  gstState: z.string().optional(),
  address: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial().omit({ password: true });

export class ClientController {
  getClients = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, page = '1', limit = '20' } = req.query;

      const where = search
        ? {
            OR: [
              { firstName: { contains: String(search), mode: 'insensitive' as const } },
              { lastName: { contains: String(search), mode: 'insensitive' as const } },
              { email: { contains: String(search), mode: 'insensitive' as const } },
              { clientProfile: { firmName: { contains: String(search), mode: 'insensitive' as const } } },
              { clientProfile: { clientCode: { contains: String(search), mode: 'insensitive' as const } } },
            ],
          }
        : {};

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: { role: 'CLIENT', ...where },
          include: { clientProfile: true },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: { role: 'CLIENT', ...where } }),
      ]);

      const safeUsers = users.map(({ password, refreshToken, ...user }) => user);

      res.json({
        success: true,
        data: safeUsers,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      next(error);
    }
  };

  getClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id, role: 'CLIENT' },
        include: {
          clientProfile: {
            include: {
              services: true,
              invoices: true,
              documentRequests: { include: { documents: true } },
              appointments: true,
            },
          },
        },
      });

      if (!user) throw new AppError('Client not found', 404);

      const { password, refreshToken, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
  };

  createClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createClientSchema.parse(req.body);

      const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (existing) throw new AppError('Email already registered', 409);

      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Generate client code
      const count = await prisma.clientProfile.count();
      const clientCode = `CAC${String(count + 1).padStart(3, '0')}`;

      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          role: 'CLIENT',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          clientProfile: {
            create: {
              clientCode,
              firmName: data.firmName,
              panNumber: data.panNumber,
              gstin: data.gstin,
              gstState: data.gstState,
              address: data.address,
              adminId: req.user!.id,
            },
          },
        },
        include: { clientProfile: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'CLIENT_CREATED',
          entity: 'User',
          entityId: user.id,
          details: { email: user.email, clientCode },
        },
      });

      const { password: _, refreshToken: __, ...safeUser } = user;
      res.status(201).json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
  };

  updateClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = updateClientSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.params.id, role: 'CLIENT' },
        include: { clientProfile: true },
      });
      if (!user) throw new AppError('Client not found', 404);

      const { firmName, panNumber, gstin, gstState, address, ...userFields } = data;

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          ...userFields,
          clientProfile: {
            update: { firmName, panNumber, gstin, gstState, address },
          },
        },
        include: { clientProfile: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'CLIENT_UPDATED',
          entity: 'User',
          entityId: updated.id,
        },
      });

      const { password: _, refreshToken: __, ...safeUser } = updated;
      res.json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
  };

  deleteClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id, role: 'CLIENT' } });
      if (!user) throw new AppError('Client not found', 404);

      await prisma.user.delete({ where: { id: req.params.id } });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'CLIENT_DELETED',
          entity: 'User',
          entityId: req.params.id,
          details: { email: user.email },
        },
      });

      res.json({ success: true, message: 'Client deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
