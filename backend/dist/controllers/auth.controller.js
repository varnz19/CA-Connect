"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const email_service_1 = require("../services/email.service");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(8),
});
class AuthController {
    constructor() {
        this.login = async (req, res, next) => {
            try {
                const { email, password } = loginSchema.parse(req.body);
                const user = await prisma_1.prisma.user.findUnique({
                    where: { email: email.toLowerCase() },
                    include: { clientProfile: true },
                });
                if (!user || !user.isActive) {
                    throw new errorHandler_1.AppError('Invalid email or password', 401);
                }
                const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
                if (!isValidPassword) {
                    throw new errorHandler_1.AppError('Invalid email or password', 401);
                }
                const tokens = (0, jwt_1.generateTokens)({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                });
                // Store refresh token
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { refreshToken: tokens.refreshToken },
                });
                // Create audit log
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: 'USER_LOGIN',
                        entity: 'User',
                        entityId: user.id,
                        ipAddress: req.ip,
                    },
                });
                const { password: _, refreshToken: __, ...safeUser } = user;
                res.json({
                    success: true,
                    data: {
                        user: safeUser,
                        tokens,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.forgotPassword = async (req, res, next) => {
            try {
                const { email } = forgotPasswordSchema.parse(req.body);
                const user = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
                // Always respond with success to prevent email enumeration
                if (!user) {
                    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
                    return;
                }
                const resetToken = crypto_1.default.randomBytes(32).toString('hex');
                const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        passwordResetToken: resetToken,
                        passwordResetExpiry: resetExpiry,
                    },
                });
                // Send email via Nodemailer
                await email_service_1.emailService.sendPasswordReset(user.email, resetToken);
                res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const { token, password } = resetPasswordSchema.parse(req.body);
                const user = await prisma_1.prisma.user.findFirst({
                    where: {
                        passwordResetToken: token,
                        passwordResetExpiry: { gt: new Date() },
                    },
                });
                if (!user) {
                    throw new errorHandler_1.AppError('Invalid or expired reset token', 400);
                }
                const hashedPassword = await bcryptjs_1.default.hash(password, 12);
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        password: hashedPassword,
                        passwordResetToken: null,
                        passwordResetExpiry: null,
                    },
                });
                await prisma_1.prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: 'PASSWORD_CHANGED',
                        entity: 'User',
                        entityId: user.id,
                    },
                });
                res.json({ success: true, message: 'Password reset successfully.' });
            }
            catch (error) {
                next(error);
            }
        };
        this.refreshToken = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken)
                    throw new errorHandler_1.AppError('Refresh token required', 401);
                const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
                const user = await prisma_1.prisma.user.findFirst({
                    where: { id: decoded.id, refreshToken },
                });
                if (!user)
                    throw new errorHandler_1.AppError('Invalid refresh token', 401);
                const tokens = (0, jwt_1.generateTokens)({ id: user.id, email: user.email, role: user.role });
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { refreshToken: tokens.refreshToken },
                });
                res.json({ success: true, data: tokens });
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (req, res, next) => {
            try {
                await prisma_1.prisma.user.update({
                    where: { id: req.user.id },
                    data: { refreshToken: null },
                });
                res.json({ success: true, message: 'Logged out successfully' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map