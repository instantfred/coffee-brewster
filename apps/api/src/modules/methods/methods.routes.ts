import { Router } from 'express';
import { getMethods, getMethodByKey } from './methods.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Optional authentication middleware - methods can be accessed without auth,
// but recommendations are filtered based on user settings if authenticated
const optionalAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.access_token;
  if (token) {
    // If token exists, use authentication middleware
    authenticate(req, res, next);
  } else {
    // If no token, continue without authentication
    next();
  }
};

router.get('/', optionalAuth, getMethods);
router.get('/:key', optionalAuth, getMethodByKey);

export { router as methodsRoutes };