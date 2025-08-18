import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
});

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, me);

export { router as authRoutes };