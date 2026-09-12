import { Router } from 'express';
import { getOutlets, getOutlet, createOutlet, updateOutlet } from '../controllers/outlet.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getOutlets));
router.get('/:id', asyncHandler(getOutlet));
router.post('/', requirePermission(PERMISSIONS.SETTINGS_MANAGE), asyncHandler(createOutlet));
router.put('/:id', requirePermission(PERMISSIONS.SETTINGS_MANAGE), asyncHandler(updateOutlet));

export default router;
