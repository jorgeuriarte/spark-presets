import { Request, Response, NextFunction } from 'express';
import { AuthToken } from '../types/user';

// Mock authentication middleware for development
export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In development mode, always authenticate with a mock user
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
    req.user = {
      userId: 'mock-user-123',
      email: 'test@sparkpresets.com',
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 86400, // 24 hours
    } as AuthToken;
    next();
  } else {
    // Fall back to real auth middleware
    next('route');
  }
};