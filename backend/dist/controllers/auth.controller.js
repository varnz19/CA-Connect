"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    phone: zod_1.z.string().optional(),
    firmName: zod_1.z.string().optional(),
    gstState: zod_1.z.string().optional(),
});
const googleLoginSchema = zod_1.z.object({
    idToken: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
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
                if (user.role === 'CLIENT' && !user.isVerified) {
                    throw new errorHandler_1.AppError('Please verify your email address to log in.', 401);
                }
                if (!user.password) {
                    throw new errorHandler_1.AppError('This account is configured for Google Login only.', 401);
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
        this.signup = async (req, res, next) => {
            try {
                const data = signupSchema.parse(req.body);
                const existingUser = await prisma_1.prisma.user.findUnique({
                    where: { email: data.email.toLowerCase() },
                });
                if (existingUser) {
                    throw new errorHandler_1.AppError('Email already registered', 409);
                }
                const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
                const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
                const defaultAdmin = await prisma_1.prisma.user.findFirst({
                    where: { role: 'ADMIN' },
                });
                const adminId = defaultAdmin ? defaultAdmin.id : 'default-admin-id';
                const clientCode = 'CAC' + Math.floor(1000 + Math.random() * 9000);
                const user = await prisma_1.prisma.user.create({
                    data: {
                        email: data.email.toLowerCase(),
                        password: hashedPassword,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        phone: data.phone,
                        isVerified: false,
                        verificationToken,
                        clientProfile: {
                            create: {
                                clientCode,
                                firmName: data.firmName || `${data.firstName} & Co.`,
                                gstState: data.gstState || 'Maharashtra',
                                adminId,
                            },
                        },
                    },
                });
                await email_service_1.emailService.sendEmailVerification(user.email, verificationToken);
                res.status(201).json({
                    success: true,
                    message: 'Registration successful! Please verify your email to log in.',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyEmail = async (req, res, next) => {
            try {
                const { token } = req.query;
                if (!token || typeof token !== 'string') {
                    throw new errorHandler_1.AppError('Verification token required', 400);
                }
                const user = await prisma_1.prisma.user.findFirst({
                    where: { verificationToken: token },
                });
                if (!user) {
                    throw new errorHandler_1.AppError('Invalid or expired verification token', 400);
                }
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        isVerified: true,
                        verificationToken: null,
                    },
                });
                res.send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #F8FAFC; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 480px; width: 100%;">
            <h1 style="color: #0B2545; margin-bottom: 16px;">Email Verified!</h1>
            <p style="color: #64748B; line-height: 1.5; margin-bottom: 24px;">Your CA Connect client email address has been successfully verified.</p>
            <p style="color: #0B2545; font-weight: bold;">You can now open the mobile application and log in.</p>
          </div>
        </div>
      `);
            }
            catch (error) {
                next(error);
            }
        };
        this.googleLogin = async (req, res, next) => {
            try {
                const { idToken, accessToken } = googleLoginSchema.parse(req.body);
                if (!idToken && !accessToken) {
                    throw new errorHandler_1.AppError('Either idToken or accessToken is required.', 400);
                }
                let payload;
                if (accessToken) {
                    try {
                        const { default: axios } = await Promise.resolve().then(() => __importStar(require('axios')));
                        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });
                        payload = response.data;
                        payload.sub = payload.id; // Normalize to match idToken format
                    }
                    catch (err) {
                        console.error('Failed to fetch user info with accessToken', err);
                        throw new errorHandler_1.AppError('Invalid access token.', 401);
                    }
                }
                else if (idToken) {
                    try {
                        const { OAuth2Client } = await Promise.resolve().then(() => __importStar(require('google-auth-library')));
                        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
                        const ticket = await client.verifyIdToken({
                            idToken,
                            audience: process.env.GOOGLE_CLIENT_ID,
                        });
                        payload = ticket.getPayload();
                    }
                    catch (verifyErr) {
                        console.error('Cryptographic Google Token Verification failed:', verifyErr);
                        const isPlaceholderClientId = !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.startsWith('1234567890');
                        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || isPlaceholderClientId) {
                            console.log('⚠️ [DEV MODE] Google verification fallback to mock parsing.');
                            const parts = idToken.split('.');
                            if (parts.length === 3) {
                                const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                                payload = {
                                    sub: decoded.sub || 'g-user-123',
                                    email: decoded.email || 'google.client@caconnect.in',
                                    given_name: decoded.given_name || 'Google',
                                    family_name: decoded.family_name || 'Client',
                                    picture: decoded.picture || '',
                                };
                            }
                        }
                        if (!payload) {
                            throw new errorHandler_1.AppError('Google verification failed. Invalid token.', 401);
                        }
                    }
                }
                if (!payload || !payload.email) {
                    throw new errorHandler_1.AppError('Google verification failed. Could not retrieve email.', 401);
                }
                const googleId = payload.sub;
                const email = payload.email.toLowerCase();
                const firstName = payload.given_name || 'Google';
                const lastName = payload.family_name || 'User';
                const avatar = payload.picture || '';
                let user = await prisma_1.prisma.user.findFirst({
                    where: {
                        OR: [
                            { googleId },
                            { email }
                        ]
                    },
                    include: { clientProfile: true },
                });
                let isNewUser = false;
                if (user) {
                    if (!user.googleId) {
                        user = await prisma_1.prisma.user.update({
                            where: { id: user.id },
                            data: { googleId, isVerified: true },
                            include: { clientProfile: true },
                        });
                    }
                }
                else {
                    isNewUser = true;
                    const defaultAdmin = await prisma_1.prisma.user.findFirst({
                        where: { role: 'ADMIN' },
                    });
                    const adminId = defaultAdmin ? defaultAdmin.id : 'default-admin-id';
                    const clientCode = 'CAC' + Math.floor(1000 + Math.random() * 9000);
                    user = await prisma_1.prisma.user.create({
                        data: {
                            email,
                            googleId,
                            firstName,
                            lastName,
                            avatar,
                            isVerified: true,
                            role: 'CLIENT',
                            clientProfile: {
                                create: {
                                    clientCode,
                                    firmName: `${firstName} & Co.`,
                                    gstState: 'Maharashtra',
                                    adminId,
                                },
                            },
                        },
                        include: { clientProfile: true },
                    });
                }
                if (!user.isActive) {
                    throw new errorHandler_1.AppError('This account has been deactivated.', 401);
                }
                const tokens = (0, jwt_1.generateTokens)({ id: user.id, email: user.email, role: user.role });
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { refreshToken: tokens.refreshToken },
                });
                const { password: _, refreshToken: __, ...safeUser } = user;
                res.json({
                    success: true,
                    data: {
                        user: safeUser,
                        tokens,
                        isNewUser,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map