import { Router } from 'express';
import { getOrganization, updateOrganization, setupOrganization } from '../controllers/organization.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(getOrganization));
router.put('/me', requirePermission(PERMISSIONS.SETTINGS_MANAGE), asyncHandler(updateOrganization));
router.post('/setup', asyncHandler(setupOrganization));

export default router;

