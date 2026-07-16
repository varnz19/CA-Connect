import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const invoiceSchema = z.object({
  clientProfileId: z.string(),
  dueDate: z.string(),
  taxRate: z.number().default(18),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
  })),
});

const generateInvoiceNumber = async (): Promise<string> => {
  const count = await prisma.invoice.count();
  const year = new Date().getFullYear();
  const nextYear = year + 1;
  return `CAC/${year}-${String(nextYear).slice(2)}/${String(count + 1).padStart(3, '0')}`;
};

export class InvoiceController {
  getInvoices = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.query;

      const where =
        req.user?.role === 'CLIENT'
          ? {
              clientProfile: { userId: req.user.id },
              ...(status ? { status: status as string } : {}),
            }
          : { ...(status ? { status: status as string } : {}) };

      const invoices = await prisma.invoice.findMany({
        where: where as object,
        include: {
          items: true,
          clientProfile: {
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  };

  getInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: req.params.id },
        include: { items: true, clientProfile: { include: { user: true } } },
      });
      if (!invoice) throw new AppError('Invoice not found', 404);

      // Mark as viewed if client is viewing
      if (req.user?.role === 'CLIENT' && !invoice.viewedAt) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { viewedAt: new Date() },
        });
      }

      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  };

  createInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = invoiceSchema.parse(req.body);

      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const cgst = subtotal * (data.taxRate / 2) / 100;
      const sgst = cgst;
      const total = subtotal + cgst + sgst;
      const invoiceNumber = await generateInvoiceNumber();

      const invoice = await prisma.invoice.create({
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

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'INVOICE_GENERATED',
          entity: 'Invoice',
          entityId: invoice.id,
          details: { invoiceNumber, total },
        },
      });

      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  };

  sendInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: req.params.id },
        data: { sentAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'INVOICE_SENT',
          entity: 'Invoice',
          entityId: invoice.id,
        },
      });

      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  };

  updateInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  };

  markPaid = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: req.params.id },
        data: { status: 'PAID', paidAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'INVOICE_PAID',
          entity: 'Invoice',
          entityId: invoice.id,
        },
      });

      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  };

  downloadPdf = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // PDF generation is handled by generating HTML and converting server-side
      // In production, use puppeteer or similar to generate PDF
      res.json({ success: true, message: 'PDF generation endpoint - integrate with PDF service in Phase 3' });
    } catch (error) {
      next(error);
    }
  };

  deleteInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.invoice.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
