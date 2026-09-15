"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const pdf_service_1 = require("../services/pdf.service");
const email_service_1 = require("../services/email.service");
const invoiceSchema = zod_1.z.object({
    clientProfileId: zod_1.z.string().min(1, 'Client ID is required'),
    dueDate: zod_1.z.string().min(1, 'Due date is required'),
    taxRate: zod_1.z.coerce.number().default(18),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string().min(1, 'Description is required'),
        quantity: zod_1.z.coerce.number().int().min(1),
        unitPrice: zod_1.z.coerce.number().min(0),
    })).min(1, 'At least one item is required'),
});
const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    const prefix = `CAC/${year}-${String(nextYear).slice(2)}/`;
    const existing = await prisma_1.prisma.invoice.findMany({
        where: { invoiceNumber: { startsWith: prefix } },
        select: { invoiceNumber: true },
    });
    let maxNum = 0;
    for (const inv of existing) {
        const parts = inv.invoiceNumber.split('/');
        const seq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(seq) && seq > maxNum) {
            maxNum = seq;
        }
    }
    const nextSeq = maxNum + 1;
    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
};
class InvoiceController {
    constructor() {
        this.getInvoices = async (req, res, next) => {
            try {
                const { status } = req.query;
                const where = req.user?.role === 'CLIENT'
                    ? {
                        clientProfile: { userId: req.user.id },
                        ...(status ? { status: status } : {}),
                    }
                    : { ...(status ? { status: status } : {}) };
                const invoices = await prisma_1.prisma.invoice.findMany({
                    where: where,
                    include: {
                        items: true,
                        clientProfile: {
                            include: { user: { select: { id: true, firstName: true, lastName: true } } },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                });
                res.json({ success: true, data: invoices });
            }
            catch (error) {
                next(error);
            }
        };
        this.getInvoice = async (req, res, next) => {
            try {
                const invoice = await prisma_1.prisma.invoice.findUnique({
                    where: { id: req.params.id },
                    include: { items: true, clientProfile: { include: { user: true } } },
                });
                if (!invoice)
                    throw new errorHandler_1.AppError('Invoice not found', 404);
                // Mark as viewed if client is viewing
                if (req.user?.role === 'CLIENT' && !invoice.viewedAt) {
                    await prisma_1.prisma.invoice.update({
                        where: { id: invoice.id },
                        data: { viewedAt: new Date() },
                    });
                }
                res.json({ success: true, data: invoice });
            }
            catch (error) {
                next(error);
            }
        };
        this.createInvoice = async (req, res, next) => {
            try {
                const data = invoiceSchema.parse(req.body);
                // Resolve clientProfileId robustly (could be clientProfile.id OR user.id)
                let targetProfile = await prisma_1.prisma.clientProfile.findUnique({
                    where: { id: data.clientProfileId },
                    include: { user: true },
                });
                if (!targetProfile) {
                    targetProfile = await prisma_1.prisma.clientProfile.findUnique({
                        where: { userId: data.clientProfileId },
                        include: { user: true },
                    });
                }
                if (!targetProfile) {
                    const user = await prisma_1.prisma.user.findUnique({ where: { id: data.clientProfileId } });
                    if (user) {
                        const profileCount = await prisma_1.prisma.clientProfile.count();
                        targetProfile = await prisma_1.prisma.clientProfile.create({
                            data: {
                                userId: user.id,
                                clientCode: `CAC-${String(profileCount + 1).padStart(3, '0')}`,
                                firmName: `${user.firstName} ${user.lastName}`,
                                adminId: req.user.id,
                            },
                            include: { user: true },
                        });
                    }
                }
                if (!targetProfile) {
                    throw new errorHandler_1.AppError('Client profile not found. Please select a registered client.', 404);
                }
                const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                const cgst = (subtotal * (data.taxRate / 2)) / 100;
                const sgst = cgst;
                const total = subtotal + cgst + sgst;
                const invoiceNumber = await generateInvoiceNumber();
                const invoice = await prisma_1.prisma.invoice.create({
                    data: {
                        clientProfileId: targetProfile.id,
                        invoiceNumber,
                        dueDate: new Date(data.dueDate),
                        taxRate: data.taxRate,
                        subtotal,
                        cgst,
                        sgst,
                        igst: 0,
                        total,
                        notes: data.notes,
                        items: {
                            create: data.items.map((item) => ({
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                amount: item.quantity * item.unitPrice,
                            })),
                        },
                    },
                    include: {
                        items: true,
                        clientProfile: {
                            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
                        },
                    },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'INVOICE_GENERATED',
                        entity: 'Invoice',
                        entityId: invoice.id,
                        details: { invoiceNumber, total },
                    },
                });
                // Notify the client in-app
                if (targetProfile.user?.id) {
                    try {
                        await prisma_1.prisma.notification.create({
                            data: {
                                userId: targetProfile.user.id,
                                type: 'INVOICE_GENERATED',
                                title: `New Tax Invoice: ${invoiceNumber}`,
                                body: `An official GST tax invoice for ₹${total.toLocaleString('en-IN')} has been issued for your practice account.`,
                                data: { invoiceId: invoice.id, invoiceNumber, total, dueDate: invoice.dueDate },
                            },
                        });
                    }
                    catch (notifErr) {
                        console.error('Failed to create in-app notification for invoice:', notifErr);
                    }
                    // Send email notification in background
                    if (targetProfile.user.email) {
                        const downloadUrl = `http://localhost:4000/api/invoices/${invoice.id}/pdf`;
                        email_service_1.emailService
                            .sendInvoiceNotification(targetProfile.user.email, `${targetProfile.user.firstName} ${targetProfile.user.lastName}`, invoiceNumber, total, downloadUrl)
                            .catch((err) => console.error('Failed to send invoice email:', err));
                    }
                }
                res.status(201).json({ success: true, data: invoice });
            }
            catch (error) {
                next(error);
            }
        };
        this.sendInvoice = async (req, res, next) => {
            try {
                const invoice = await prisma_1.prisma.invoice.update({
                    where: { id: req.params.id },
                    data: { sentAt: new Date() },
                    include: {
                        clientProfile: {
                            include: {
                                user: true,
                            },
                        },
                    },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'INVOICE_SENT',
                        entity: 'Invoice',
                        entityId: invoice.id,
                    },
                });
                // Send invoice PDF email notification in background
                if (invoice.clientProfile?.user?.email) {
                    const clientEmail = invoice.clientProfile.user.email;
                    const clientName = `${invoice.clientProfile.user.firstName} ${invoice.clientProfile.user.lastName}`;
                    const downloadUrl = `http://localhost:3000/api/invoices/${invoice.id}/pdf`;
                    email_service_1.emailService
                        .sendInvoiceNotification(clientEmail, clientName, invoice.invoiceNumber, invoice.total, downloadUrl)
                        .catch((err) => {
                        console.error('Failed to send invoice notification email:', err);
                    });
                }
                res.json({ success: true, data: invoice });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateInvoice = async (req, res, next) => {
            try {
                const invoice = await prisma_1.prisma.invoice.update({
                    where: { id: req.params.id },
                    data: req.body,
                });
                res.json({ success: true, data: invoice });
            }
            catch (error) {
                next(error);
            }
        };
        this.markPaid = async (req, res, next) => {
            try {
                const invoice = await prisma_1.prisma.invoice.update({
                    where: { id: req.params.id },
                    data: { status: 'PAID', paidAt: new Date() },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'INVOICE_PAID',
                        entity: 'Invoice',
                        entityId: invoice.id,
                    },
                });
                res.json({ success: true, data: invoice });
            }
            catch (error) {
                next(error);
            }
        };
        this.downloadPdf = async (req, res, next) => {
            try {
                const invoice = await prisma_1.prisma.invoice.findUnique({
                    where: { id: req.params.id },
                    include: {
                        items: true,
                        clientProfile: {
                            include: { user: true }
                        }
                    }
                });
                if (!invoice)
                    throw new errorHandler_1.AppError('Invoice not found', 404);
                const pdfBuffer = await (0, pdf_service_1.generateInvoicePdf)(invoice);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`);
                res.send(pdfBuffer);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteInvoice = async (req, res, next) => {
            try {
                await prisma_1.prisma.invoice.delete({ where: { id: req.params.id } });
                res.json({ success: true, message: 'Invoice deleted successfully' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.InvoiceController = InvoiceController;
//# sourceMappingURL=invoice.controller.js.map