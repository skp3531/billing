import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const hasPermission = requiredPermissions.some((permission) =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return errorResponse(res, 'Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};
