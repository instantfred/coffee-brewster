import { Router } from 'express';
import { calculateReverseBrew } from './reverse.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All reverse brew routes require authentication to access user settings
router.use(authenticate);

router.post('/', calculateReverseBrew);

export { router as reverseRoutes };