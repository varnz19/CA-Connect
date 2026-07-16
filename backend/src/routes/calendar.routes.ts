import { Router } from 'express';
import { CalendarController } from '../controllers/remaining.controllers';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new CalendarController();

router.use(authenticate);
router.get('/', controller.getEvents);
router.post('/', requireAdmin, controller.createEvent);
router.put('/:id', requireAdmin, controller.updateEvent);
router.delete('/:id', requireAdmin, controller.deleteEvent);

export default router;
