"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remaining_controllers_1 = require("../controllers/remaining.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new remaining_controllers_1.AppointmentController();
router.use(auth_middleware_1.authenticate);
router.get('/', controller.getAppointments);
router.get('/:id', controller.getAppointment);
router.post('/', controller.createAppointment);
router.put('/:id/confirm', auth_middleware_1.requireAdmin, controller.confirmAppointment);
router.put('/:id/reject', auth_middleware_1.requireAdmin, controller.rejectAppointment);
router.put('/:id/reschedule', auth_middleware_1.requireAdmin, controller.rescheduleAppointment);
router.put('/:id/cancel', controller.cancelAppointment);
router.put('/:id/complete', auth_middleware_1.requireAdmin, controller.completeAppointment);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map