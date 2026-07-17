"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new service_controller_1.ServiceController();
router.use(auth_middleware_1.authenticate);
// Both admin and client can GET services
router.get('/', controller.getServices);
router.get('/:id', controller.getService);
// Only admin can create, update, delete
router.post('/', auth_middleware_1.requireAdmin, controller.createService);
router.put('/:id', auth_middleware_1.requireAdmin, controller.updateService);
router.delete('/:id', auth_middleware_1.requireAdmin, controller.deleteService);
exports.default = router;
//# sourceMappingURL=service.routes.js.map