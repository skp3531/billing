import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customer.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.CUSTOMERS_VIEW), asyncHandler(getCustomers));
router.post('/', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), asyncHandler(createCustomer));
router.put('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), asyncHandler(updateCustomer));
router.delete('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), asyncHandler(deleteCustomer));

export default router;
