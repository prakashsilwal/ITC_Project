import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided', 'NO_TOKEN');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Invalid authorization header format', 'INVALID_TOKEN_FORMAT');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('No token provided', 'NO_TOKEN');
    }

    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token has expired') {
        next(new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED'));
      } else if (error.message === 'Invalid token') {
        next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
      } else if (error instanceof UnauthorizedError) {
        next(error);
      } else {
        next(new UnauthorizedError('Authentication failed', 'AUTH_FAILED'));
      }
    } else {
      next(new UnauthorizedError('Authentication failed', 'AUTH_FAILED'));
    }
  }
}
