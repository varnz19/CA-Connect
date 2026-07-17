import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class ServiceController {
    getServices: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getService: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    createService: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    updateService: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteService: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=service.controller.d.ts.map