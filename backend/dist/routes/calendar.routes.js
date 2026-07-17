"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remaining_controllers_1 = require("../controllers/remaining.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new remaining_controllers_1.CalendarController();
router.use(auth_middleware_1.authenticate);
router.get('/', controller.getEvents);
router.post('/', auth_middleware_1.requireAdmin, controller.createEvent);
router.put('/:id', auth_middleware_1.requireAdmin, controller.updateEvent);
router.delete('/:id', auth_middleware_1.requireAdmin, controller.deleteEvent);
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map