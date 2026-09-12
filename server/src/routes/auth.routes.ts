import { Router } from 'express';
import { login, logout, refresh, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validateLogin } from '../validators/auth.validator';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/login', validateLogin, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/refresh', asyncHandler(refresh));
router.get('/me', authenticate, asyncHandler(getMe));

export default router;
