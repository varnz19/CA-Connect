"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClient = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const authenticate = async (req, res, next) => {
    try {
        let token = '';
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.query.token && typeof req.query.token === 'string') {
            token = req.query.token;
        }
        if (!token) {
            res.status(401).json({ success: false, message: 'Access token required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        // Verify user still exists and is active
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, isActive: true },
        });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Account not found or deactivated' });
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ success: false, message: 'Token expired' });
            return;
        }
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireClient = (req, res, next) => {
    if (req.user?.role !== 'CLIENT') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Client access only.',
        });
        return;
    }
    next();
};
exports.requireClient = requireClient;
//# sourceMappingURL=auth.middleware.js.map