import { Router } from 'express';
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} from './sessions.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All session routes require authentication
router.use(authenticate);

router.get('/', getSessions);
router.post('/', createSession);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export { router as sessionsRoutes };