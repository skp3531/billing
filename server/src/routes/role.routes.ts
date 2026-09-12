import { Router } from 'express';
import { getRoles, getRole, createRole, updateRole } from '../controllers/role.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.ROLES_VIEW), asyncHandler(getRoles));
router.get('/:id', requirePermission(PERMISSIONS.ROLES_VIEW), asyncHandler(getRole));
router.post('/', requirePermission(PERMISSIONS.ROLES_MANAGE), asyncHandler(createRole));
router.put('/:id', requirePermission(PERMISSIONS.ROLES_MANAGE), asyncHandler(updateRole));

export default router;
