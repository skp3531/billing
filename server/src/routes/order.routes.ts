import { Router } from 'express';
import { createOrder, getOrders, getOrder, updateOrderStatus, deleteOrder, updateOrderItemStatus } from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.ORDERS_VIEW), asyncHandler(getOrders));
router.get('/:id', requirePermission(PERMISSIONS.ORDERS_VIEW), asyncHandler(getOrder));
router.post('/', requirePermission(PERMISSIONS.POS_MANAGE), asyncHandler(createOrder));
router.patch('/:id/status', requirePermission(PERMISSIONS.ORDERS_MANAGE), asyncHandler(updateOrderStatus));
router.patch('/:id/items/:itemId/status', requirePermission(PERMISSIONS.ORDERS_MANAGE), asyncHandler(updateOrderItemStatus));
router.delete('/:id', requirePermission(PERMISSIONS.ORDERS_MANAGE), asyncHandler(deleteOrder));

export default router;
