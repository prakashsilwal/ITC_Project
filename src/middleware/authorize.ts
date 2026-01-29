import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '@prisma/client';

/**
 * Middleware to authorize users based on their roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as UserRole;

    if (!userRole) {
      throw new ForbiddenError('Access denied. No role found.', 'NO_ROLE');
    }

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError('Access denied. Insufficient permissions.', 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
}

/**
 * Middleware to ensure only SUPER_ADMIN can access the route
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  const userRole = req.user?.role as UserRole;

  if (userRole !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenError('Access denied. Only SUPER_ADMIN can perform this action.', 'SUPER_ADMIN_ONLY');
  }

  next();
}

/**
 * Middleware to ensure ADMIN or SUPER_ADMIN can access the route
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const userRole = req.user?.role as UserRole;

  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenError('Access denied. Admin privileges required.', 'ADMIN_ONLY');
  }

  next();
}
