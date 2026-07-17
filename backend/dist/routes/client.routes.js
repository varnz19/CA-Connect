"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_controller_1 = require("../controllers/client.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new client_controller_1.ClientController();
// All client management routes require admin access
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
router.get('/', controller.getClients);
router.post('/', controller.createClient);
router.get('/:id', controller.getClient);
router.put('/:id', controller.updateClient);
router.delete('/:id', controller.deleteClient);
exports.default = router;
//# sourceMappingURL=client.routes.js.map