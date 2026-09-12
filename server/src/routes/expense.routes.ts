import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expense.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.EXPENSES_VIEW), asyncHandler(getExpenses));
router.post('/', requirePermission(PERMISSIONS.EXPENSES_MANAGE), asyncHandler(createExpense));
router.put('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE), asyncHandler(updateExpense));
router.delete('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE), asyncHandler(deleteExpense));

export default router;
