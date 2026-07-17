import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (err: Error & {
    statusCode?: number;
    code?: string;
}, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
//# sourceMappingURL=errorHandler.d.ts.map