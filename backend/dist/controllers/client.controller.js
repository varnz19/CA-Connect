"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const createClientSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10, 'Phone is required'),
    firmName: zod_1.z.string().min(1, 'Firm Name is required'),
    panNumber: zod_1.z.string().min(10, 'PAN is required'),
    gstin: zod_1.z.string().min(15, 'GSTIN is required'),
    gstState: zod_1.z.string().min(1, 'GST State is required'),
    address: zod_1.z.string().min(5, 'Address is required'),
});
const updateClientSchema = createClientSchema.partial();
class ClientController {
    constructor() {
        this.getClients = async (req, res, next) => {
            try {
                const { search, page = '1', limit = '20' } = req.query;
                const where = search
                    ? {
                        OR: [
                            { firstName: { contains: String(search), mode: 'insensitive' } },
                            { lastName: { contains: String(search), mode: 'insensitive' } },
                            { email: { contains: String(search), mode: 'insensitive' } },
                            { clientProfile: { firmName: { contains: String(search), mode: 'insensitive' } } },
                            { clientProfile: { clientCode: { contains: String(search), mode: 'insensitive' } } },
                        ],
                    }
                    : {};
                const skip = (Number(page) - 1) * Number(limit);
                const [users, total] = await Promise.all([
                    prisma_1.prisma.user.findMany({
                        where: { role: 'CLIENT', ...where },
                        include: { clientProfile: true },
                        skip,
                        take: Number(limit),
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma_1.prisma.user.count({ where: { role: 'CLIENT', ...where } }),
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
            }
            catch (error) {
                next(error);
            }
        };
        this.getClient = async (req, res, next) => {
            try {
                const user = await prisma_1.prisma.user.findUnique({
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
                if (!user)
                    throw new errorHandler_1.AppError('Client not found', 404);
                const { password, refreshToken, ...safeUser } = user;
                res.json({ success: true, data: safeUser });
            }
            catch (error) {
                next(error);
            }
        };
        this.createClient = async (req, res, next) => {
            try {
                const data = createClientSchema.parse(req.body);
                const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
                if (existing)
                    throw new errorHandler_1.AppError('Email already registered', 409);
                // Generate client code
                const count = await prisma_1.prisma.clientProfile.count();
                const clientCode = `CAC${String(count + 1).padStart(3, '0')}`;
                const user = await prisma_1.prisma.user.create({
                    data: {
                        email: data.email.toLowerCase(),
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
                                adminId: req.user.id,
                            },
                        },
                    },
                    include: { clientProfile: true },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'CLIENT_CREATED',
                        entity: 'User',
                        entityId: user.id,
                        details: { email: user.email, clientCode },
                    },
                });
                const { password: _, refreshToken: __, ...safeUser } = user;
                res.status(201).json({ success: true, data: safeUser });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateClient = async (req, res, next) => {
            try {
                const data = updateClientSchema.parse(req.body);
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: req.params.id, role: 'CLIENT' },
                    include: { clientProfile: true },
                });
                if (!user)
                    throw new errorHandler_1.AppError('Client not found', 404);
                const { firmName, panNumber, gstin, gstState, address, ...userFields } = data;
                const updated = await prisma_1.prisma.user.update({
                    where: { id: req.params.id },
                    data: {
                        ...userFields,
                        clientProfile: {
                            update: { firmName, panNumber, gstin, gstState, address },
                        },
                    },
                    include: { clientProfile: true },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'CLIENT_UPDATED',
                        entity: 'User',
                        entityId: updated.id,
                    },
                });
                const { password: _, refreshToken: __, ...safeUser } = updated;
                res.json({ success: true, data: safeUser });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteClient = async (req, res, next) => {
            try {
                const user = await prisma_1.prisma.user.findUnique({ where: { id: req.params.id, role: 'CLIENT' } });
                if (!user)
                    throw new errorHandler_1.AppError('Client not found', 404);
                await prisma_1.prisma.user.delete({ where: { id: req.params.id } });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'CLIENT_DELETED',
                        entity: 'User',
                        entityId: req.params.id,
                        details: { email: user.email },
                    },
                });
                res.json({ success: true, message: 'Client deleted successfully' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ClientController = ClientController;
//# sourceMappingURL=client.controller.js.map