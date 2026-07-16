import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new InvoiceController();

router.use(authenticate);

router.get('/', controller.getInvoices);
router.get('/:id', controller.getInvoice);
router.get('/:id/pdf', controller.downloadPdf);

router.post('/', requireAdmin, controller.createInvoice);
router.post('/:id/send', requireAdmin, controller.sendInvoice);
router.put('/:id', requireAdmin, controller.updateInvoice);
router.put('/:id/mark-paid', requireAdmin, controller.markPaid);
router.delete('/:id', requireAdmin, controller.deleteInvoice);

export default router;
