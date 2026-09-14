import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.MENU_VIEW, PERMISSIONS.POS_VIEW), asyncHandler(getCategories));
router.post('/', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_CREATE), asyncHandler(createCategory));
router.put('/:id', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_EDIT), asyncHandler(updateCategory));
router.delete('/:id', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_DELETE), asyncHandler(deleteCategory));

export default router;
