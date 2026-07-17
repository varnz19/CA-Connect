"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const serviceSchema = zod_1.z.object({
    clientProfileId: zod_1.z.string(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).default('ACTIVE'),
    startDate: zod_1.z.string(),
    dueDate: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
class ServiceController {
    constructor() {
        this.getServices = async (req, res, next) => {
            try {
                const where = req.user?.role === 'CLIENT'
                    ? {
                        clientProfile: { userId: req.user.id },
                    }
                    : {};
                const services = await prisma_1.prisma.service.findMany({
                    where,
                    include: {
                        clientProfile: {
                            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                });
                res.json({ success: true, data: services });
            }
            catch (error) {
                next(error);
            }
        };
        this.getService = async (req, res, next) => {
            try {
                const service = await prisma_1.prisma.service.findUnique({
                    where: { id: req.params.id },
                    include: { clientProfile: { include: { user: true } } },
                });
                if (!service)
                    throw new errorHandler_1.AppError('Service not found', 404);
                res.json({ success: true, data: service });
            }
            catch (error) {
                next(error);
            }
        };
        this.createService = async (req, res, next) => {
            try {
                const data = serviceSchema.parse(req.body);
                const service = await prisma_1.prisma.service.create({
                    data: {
                        ...data,
                        startDate: new Date(data.startDate),
                        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                    },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'SERVICE_ASSIGNED',
                        entity: 'Service',
                        entityId: service.id,
                        details: { name: service.name },
                    },
                });
                res.status(201).json({ success: true, data: service });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateService = async (req, res, next) => {
            try {
                const data = serviceSchema.partial().parse(req.body);
                const service = await prisma_1.prisma.service.update({
                    where: { id: req.params.id },
                    data: {
                        ...data,
                        startDate: data.startDate ? new Date(data.startDate) : undefined,
                        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
                    },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'SERVICE_UPDATED',
                        entity: 'Service',
                        entityId: service.id,
                    },
                });
                res.json({ success: true, data: service });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteService = async (req, res, next) => {
            try {
                await prisma_1.prisma.service.delete({ where: { id: req.params.id } });
                res.json({ success: true, message: 'Service deleted successfully' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ServiceController = ServiceController;
//# sourceMappingURL=service.controller.js.map