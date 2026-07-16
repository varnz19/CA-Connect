import { Router } from 'express';
import { AppointmentController } from '../controllers/remaining.controllers';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new AppointmentController();

router.use(authenticate);
router.get('/', controller.getAppointments);
router.get('/:id', controller.getAppointment);
router.post('/', controller.createAppointment);
router.put('/:id/confirm', requireAdmin, controller.confirmAppointment);
router.put('/:id/reject', requireAdmin, controller.rejectAppointment);
router.put('/:id/reschedule', requireAdmin, controller.rescheduleAppointment);
router.put('/:id/cancel', controller.cancelAppointment);
router.put('/:id/complete', requireAdmin, controller.completeAppointment);

export default router;
