import { Router } from 'express';
import { getReservations, createReservation, updateReservation, deleteReservation } from '../controllers/reservation.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', getReservations);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export default router;
