import { Router } from 'express';
import { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, downloadCsvTemplate, importCsv } from '../controllers/menuItem.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';
import { uploadCSV } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/csv/template', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(downloadCsvTemplate));
router.post('/csv/import', requirePermission(PERMISSIONS.MENU_MANAGE), uploadCSV.single('file'), asyncHandler(importCsv));

router.get('/', requirePermission(PERMISSIONS.MENU_VIEW), asyncHandler(getMenuItems));
router.get('/:id', requirePermission(PERMISSIONS.MENU_VIEW), asyncHandler(getMenuItem));
router.post('/', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(createMenuItem));
router.put('/:id', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(updateMenuItem));
router.delete('/:id', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(deleteMenuItem));

export default router;
