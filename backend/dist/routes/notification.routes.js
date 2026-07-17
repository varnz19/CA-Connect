"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remaining_controllers_1 = require("../controllers/remaining.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new remaining_controllers_1.NotificationController();
router.use(auth_middleware_1.authenticate);
router.get('/', controller.getNotifications);
router.put('/:id/read', controller.markAsRead);
router.put('/read-all', controller.markAllAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map