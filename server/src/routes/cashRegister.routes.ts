import { Router } from 'express';
import { 
  getCurrentRegister, 
  openRegister, 
  closeRegister, 
  getRegisterHistory 
} from '../controllers/cashRegister.controller';
import { authenticate } from '../middleware/authenticate';
import { requirePermission } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permissions';

const router = Router();

router.use(authenticate);

// POS Operations (needs POS access)
router.get('/current', requirePermission(PERMISSIONS.POS_VIEW), getCurrentRegister);
router.post('/open', requirePermission(PERMISSIONS.POS_VIEW), openRegister);
router.post('/close', requirePermission(PERMISSIONS.POS_VIEW), closeRegister);

// Management Operations (needs reporting access)
router.get('/history', requirePermission(PERMISSIONS.REPORTS_VIEW), getRegisterHistory);

export default router;
