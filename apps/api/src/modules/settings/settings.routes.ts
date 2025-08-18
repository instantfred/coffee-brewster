import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

router.get('/', getSettings);
router.put('/', updateSettings);

export { router as settingsRoutes };