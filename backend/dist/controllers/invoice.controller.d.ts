import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class InvoiceController {
    getInvoices: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getInvoice: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    createInvoice: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    sendInvoice: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    updateInvoice: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    markPaid: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    downloadPdf: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteInvoice: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=invoice.controller.d.ts.map