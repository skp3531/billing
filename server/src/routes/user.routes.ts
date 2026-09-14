import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.STAFF_VIEW), asyncHandler(getUsers));
router.get('/:id', asyncHandler(getUser)); // Check inside controller for self
router.post('/', requirePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.STAFF_CREATE), asyncHandler(createUser));
router.put('/:id', requirePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.STAFF_EDIT), asyncHandler(updateUser));
router.delete('/:id', requirePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.STAFF_DELETE), asyncHandler(deleteUser));

export default router;
