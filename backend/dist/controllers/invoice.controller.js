"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const pdf_service_1 = require("../services/pdf.service");
const invoiceSchema = zod_1.z.object({
    clientProfileId: zod_1.z.string(),
    dueDate: zod_1.z.string(),
    taxRate: zod_1.z.number().default(18),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().int().min(1),
        unitPrice: zod_1.z.number().min(0),
    })),
});
const generateInvoiceNumber = async () => {
    const count = await prisma_1.prisma.invoice.count();
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    return `CAC/${year}-${String(nextYear).slice(2)}/${String(count + 1).padStart(3, '0')}`;
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
                const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                const cgst = subtotal * (data.taxRate / 2) / 100;
                const sgst = cgst;
                const total = subtotal + cgst + sgst;
                const invoiceNumber = await generateInvoiceNumber();
                const invoice = await prisma_1.prisma.invoice.create({
                    data: {
                        clientProfileId: data.clientProfileId,
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
                    include: { items: true },
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
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'INVOICE_SENT',
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