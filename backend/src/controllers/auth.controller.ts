import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { emailService } from '../services/email.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export class AuthController {
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { clientProfile: true },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid email or password', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid email or password', 401);
      }

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      // Create audit log
      await prisma.auditLog.create({
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
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

      // Always respond with success to prevent email enumeration
      if (!user) {
        res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetExpiry,
        },
      });

      // Send email via Nodemailer
      await emailService.sendPasswordReset(user.email, resetToken);

      res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);

      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGED',
          entity: 'User',
          entityId: user.id,
        },
      });

      res.json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new AppError('Refresh token required', 401);

      const decoded = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findFirst({
        where: { id: decoded.id, refreshToken },
      });

      if (!user) throw new AppError('Invalid refresh token', 401);

      const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { refreshToken: null },
      });
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };
}
