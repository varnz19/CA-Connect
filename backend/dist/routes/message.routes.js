"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remaining_controllers_1 = require("../controllers/remaining.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new remaining_controllers_1.MessageController();
router.use(auth_middleware_1.authenticate);
router.get('/conversations', controller.getConversations);
router.get('/conversations/:conversationId', controller.getMessages);
router.post('/send', controller.sendMessage);
router.put('/:messageId/read', controller.markAsRead);
exports.default = router;
//# sourceMappingURL=message.routes.js.map