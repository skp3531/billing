import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

export const requireOutletAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  // Determine the requested outletId from query, params, or body
  const outletId = req.query.outletId || req.params.outletId || req.body.outletId;

  if (!outletId) {
    return next();
  }

  const hasAccess = req.user.outletIds.includes(outletId as string);

  if (!hasAccess) {
    return errorResponse(res, 'Forbidden: You do not have access to this outlet', 403);
  }

  next();
};
