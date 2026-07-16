import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new ServiceController();

router.use(authenticate);

// Both admin and client can GET services
router.get('/', controller.getServices);
router.get('/:id', controller.getService);

// Only admin can create, update, delete
router.post('/', requireAdmin, controller.createService);
router.put('/:id', requireAdmin, controller.updateService);
router.delete('/:id', requireAdmin, controller.deleteService);

export default router;
