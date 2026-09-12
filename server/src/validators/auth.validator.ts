import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse';

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req: Request, res: Response, next: import('express').NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation Error', 400, errors.array());
    }
    next();
  },
];
