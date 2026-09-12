import { Router } from 'express';
import { getRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '../controllers/rawMaterial.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.INVENTORY_VIEW), asyncHandler(getRawMaterials));
router.post('/', requirePermission(PERMISSIONS.INVENTORY_MANAGE), asyncHandler(createRawMaterial));
router.put('/:id', requirePermission(PERMISSIONS.INVENTORY_MANAGE), asyncHandler(updateRawMaterial));
router.delete('/:id', requirePermission(PERMISSIONS.INVENTORY_MANAGE), asyncHandler(deleteRawMaterial));

export default router;
