import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class ClientController {
    getClients: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    createClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    updateClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=client.controller.d.ts.map