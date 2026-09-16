import { Router } from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, logPayment } from '../controllers/supplier.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.SUPPLIERS_VIEW), asyncHandler(getSuppliers));
router.post('/', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_CREATE), asyncHandler(createSupplier));
router.put('/:id', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_EDIT), asyncHandler(updateSupplier));
router.delete('/:id', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_DELETE), asyncHandler(deleteSupplier));
router.post("/:id/pay", requirePermission(PERMISSIONS.SUPPLIERS_MANAGE), asyncHandler(logPayment));

export default router;
