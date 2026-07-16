import { Router } from 'express';
import { ProfileController } from '../controllers/remaining.controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new ProfileController();

router.use(authenticate);
router.get('/', controller.getProfile);
router.put('/', controller.updateProfile);
router.put('/password', controller.changePassword);

export default router;
