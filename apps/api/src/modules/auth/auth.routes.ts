import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, me as any);

export { router as authRoutes };