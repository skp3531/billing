import { Router } from 'express';
import { 
  getExpenses, 
  createExpense, 
  updateExpenseStatus, 
  getCommandCenter,
  getCategories,
  createCategory,
  getBudgets,
  createBudget
} from '../controllers/expense.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

// BI
router.get('/command-center', requirePermission(PERMISSIONS.EXPENSES_VIEW), getCommandCenter);

// Categories
router.get('/categories', requirePermission(PERMISSIONS.EXPENSES_VIEW), getCategories);
router.post('/categories', requirePermission(PERMISSIONS.EXPENSES_MANAGE), createCategory);

// Budgets
router.get('/budgets', requirePermission(PERMISSIONS.EXPENSES_VIEW), getBudgets);
router.post('/budgets', requirePermission(PERMISSIONS.EXPENSES_MANAGE), createBudget);

// Expenses
router.get('/', requirePermission(PERMISSIONS.EXPENSES_VIEW), getExpenses);
router.post('/', requirePermission(PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_CREATE), createExpense);
router.patch('/:id/status', requirePermission(PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_EDIT), updateExpenseStatus);

export default router;
