import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const serviceSchema = z.object({
  clientProfileId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).default('ACTIVE'),
  startDate: z.string(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export class ServiceController {
  getServices = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const where =
        req.user?.role === 'CLIENT'
          ? {
              clientProfile: { userId: req.user.id },
            }
          : {};

      const services = await prisma.service.findMany({
        where,
        include: {
          clientProfile: {
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: services });
    } catch (error) {
      next(error);
    }
  };

  getService = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = await prisma.service.findUnique({
        where: { id: req.params.id },
        include: { clientProfile: { include: { user: true } } },
      });
      if (!service) throw new AppError('Service not found', 404);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  };

  createService = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = serviceSchema.parse(req.body);
      const service = await prisma.service.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'SERVICE_ASSIGNED',
          entity: 'Service',
          entityId: service.id,
          details: { name: service.name },
        },
      });

      res.status(201).json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  };

  updateService = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = serviceSchema.partial().parse(req.body);
      const service = await prisma.service.update({
        where: { id: req.params.id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'SERVICE_UPDATED',
          entity: 'Service',
          entityId: service.id,
        },
      });

      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  };

  deleteService = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.service.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
