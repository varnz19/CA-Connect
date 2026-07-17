"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remaining_controllers_1 = require("../controllers/remaining.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new remaining_controllers_1.ProfileController();
router.use(auth_middleware_1.authenticate);
router.get('/', controller.getProfile);
router.put('/', controller.updateProfile);
router.put('/password', controller.changePassword);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map