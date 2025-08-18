import { AuthenticatedRequest } from '../middleware/auth';

declare global {
  namespace Express {
    interface Request extends Partial<AuthenticatedRequest> {}
  }
}