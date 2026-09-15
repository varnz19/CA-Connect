"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new invoice_controller_1.InvoiceController();
// Public/Direct PDF download route (accessible directly by invoice ID)
router.get('/:id/pdf', controller.downloadPdf);
router.use(auth_middleware_1.authenticate);
router.get('/', controller.getInvoices);
router.get('/:id', controller.getInvoice);
router.post('/', auth_middleware_1.requireAdmin, controller.createInvoice);
router.post('/:id/send', auth_middleware_1.requireAdmin, controller.sendInvoice);
router.put('/:id', auth_middleware_1.requireAdmin, controller.updateInvoice);
router.put('/:id/mark-paid', controller.markPaid);
router.delete('/:id', auth_middleware_1.requireAdmin, controller.deleteInvoice);
exports.default = router;
//# sourceMappingURL=invoice.routes.js.map