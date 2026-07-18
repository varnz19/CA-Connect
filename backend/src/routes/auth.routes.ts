import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const auth = new AuthController();

router.post('/login', auth.login);
router.post('/signup', auth.signup);
router.get('/verify-email', auth.verifyEmail);
router.post('/google', auth.googleLogin);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/refresh-token', auth.refreshToken);
router.post('/logout', authenticate, auth.logout);

export default router;
