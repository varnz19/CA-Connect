"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const auth = new auth_controller_1.AuthController();
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/refresh-token', auth.refreshToken);
router.post('/logout', auth_middleware_1.authenticate, auth.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map