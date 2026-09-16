import { Router } from 'express';
import { PERMISSIONS } from '../utils/permissions';
import {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable,
  getTableDashboard,
} from '../controllers/table.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';

const router = Router();

// Require authentication for all table routes
router.use(authenticate);

// Basic CRUD operations (require pos.manage or tables.manage permission - assuming pos.manage for simplicity here, adjust as needed based on your permissions structure)
router.post('/', requirePermission('pos.manage'), createTable);
router.get('/dashboard', getTableDashboard);

router.get('/', getTables); // Anyone authenticated can view tables usually (for taking orders)
router.get('/:id', getTableById);
router.put('/:id', requirePermission('pos.manage'), updateTable);
router.delete('/:id', requirePermission('pos.manage'), deleteTable);

export default router;
