import { Router } from 'express';
import { getWaitlist, createWaitlistEntry, updateWaitlistEntry, deleteWaitlistEntry } from '../controllers/waitlist.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', getWaitlist);
router.post('/', createWaitlistEntry);
router.put('/:id', updateWaitlistEntry);
router.delete('/:id', deleteWaitlistEntry);

export default router;
