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


export const assertOutletAccess = (outletId: string, user: any): boolean => {
  if (!user || !user.outletIds) return false;
  
  // OWNER can access all, but outletIds should already be populated for owner.
  // We strictly check if the requested outletId exists in user's allowed outletIds.
  return user.outletIds.includes(outletId.toString());
};
