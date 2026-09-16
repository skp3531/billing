import { Router } from 'express';
import { getPurchases, createPurchase, updatePurchaseStatus, getProcurementAnalytics } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/analytics', requirePermission(PERMISSIONS.PURCHASES_VIEW), getProcurementAnalytics);
router.get('/', requirePermission(PERMISSIONS.PURCHASES_VIEW), getPurchases);
router.post('/', requirePermission(PERMISSIONS.PURCHASES_MANAGE, PERMISSIONS.PURCHASES_CREATE), createPurchase);
router.patch('/:id/status', requirePermission(PERMISSIONS.PURCHASES_MANAGE, PERMISSIONS.PURCHASES_EDIT), updatePurchaseStatus);

export default router;
