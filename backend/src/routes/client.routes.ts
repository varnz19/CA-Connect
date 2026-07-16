import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new ClientController();

// All client management routes require admin access
router.use(authenticate, requireAdmin);

router.get('/', controller.getClients);
router.post('/', controller.createClient);
router.get('/:id', controller.getClient);
router.put('/:id', controller.updateClient);
router.delete('/:id', controller.deleteClient);

export default router;
