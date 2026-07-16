import { Router } from 'express';
import { DocumentController } from '../controllers/remaining.controllers';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const controller = new DocumentController();

router.use(authenticate);
router.get('/', controller.getDocumentRequests);
router.get('/:id', controller.getDocumentRequest);
router.post('/', requireAdmin, controller.createDocumentRequest);
router.put('/:id/approve', requireAdmin, controller.approveDocument);
router.put('/:id/reject', requireAdmin, controller.rejectDocument);
router.post('/:id/upload', upload.single('file'), controller.uploadDocument);
router.delete('/:id', requireAdmin, controller.deleteDocumentRequest);

export default router;
