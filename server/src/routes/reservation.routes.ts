import { Router } from 'express';
import { 
  getReservations, createReservation, updateReservationStatus,
  getWaitlist, addToWaitlist, updateWaitlistStatus
} from '../controllers/reservation.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', getReservations);
router.post('/', createReservation);
router.patch('/:id/status', updateReservationStatus);

router.get('/waitlist', getWaitlist);
router.post('/waitlist', addToWaitlist);
router.patch('/waitlist/:id/status', updateWaitlistStatus);

export default router;
