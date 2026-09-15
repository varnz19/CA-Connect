import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new InvoiceController();

// Public/Direct PDF download route (accessible directly by invoice ID)
router.get('/:id/pdf', controller.downloadPdf);

router.use(authenticate);

router.get('/', controller.getInvoices);
router.get('/:id', controller.getInvoice);

router.post('/', requireAdmin, controller.createInvoice);
router.post('/:id/send', requireAdmin, controller.sendInvoice);
router.put('/:id', requireAdmin, controller.updateInvoice);
router.put('/:id/mark-paid', controller.markPaid);
router.delete('/:id', requireAdmin, controller.deleteInvoice);

export default router;
