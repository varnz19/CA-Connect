import { Router } from 'express';
import { NotificationController } from '../controllers/remaining.controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

router.use(authenticate);
router.get('/', controller.getNotifications);
router.put('/:id/read', controller.markAsRead);
router.put('/read-all', controller.markAllAsRead);

export default router;
