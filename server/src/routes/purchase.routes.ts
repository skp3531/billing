import { Router } from 'express';
import { getPurchases, createPurchase, updatePurchaseStatus } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.PURCHASES_VIEW), asyncHandler(getPurchases));
router.post('/', requirePermission(PERMISSIONS.PURCHASES_MANAGE, PERMISSIONS.PURCHASES_CREATE), asyncHandler(createPurchase));
router.patch('/:id/status', requirePermission(PERMISSIONS.PURCHASES_MANAGE, PERMISSIONS.PURCHASES_EDIT), asyncHandler(updatePurchaseStatus));

export default router;
