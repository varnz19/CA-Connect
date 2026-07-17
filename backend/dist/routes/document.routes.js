"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remaining_controllers_1 = require("../controllers/remaining.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const controller = new remaining_controllers_1.DocumentController();
router.use(auth_middleware_1.authenticate);
router.get('/', controller.getDocumentRequests);
router.get('/:id', controller.getDocumentRequest);
router.post('/', auth_middleware_1.requireAdmin, controller.createDocumentRequest);
router.put('/:id/approve', auth_middleware_1.requireAdmin, controller.approveDocument);
router.put('/:id/reject', auth_middleware_1.requireAdmin, controller.rejectDocument);
router.post('/:id/upload', upload_middleware_1.upload.single('file'), controller.uploadDocument);
router.delete('/:id', auth_middleware_1.requireAdmin, controller.deleteDocumentRequest);
exports.default = router;
//# sourceMappingURL=document.routes.js.map