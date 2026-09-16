import { Request, Response } from 'express';
import Reservation from '../models/Reservation';

export const getReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await Reservation.find({ organizationId: req.user?.organizationId }).sort({ reservationDate: 1, reservationTime: 1 }).populate('assignedTableId', 'name');
    res.json({ data: reservations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createReservation = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, organizationId: req.user?.organizationId };
    const reservation = await Reservation.create(data);
    res.status(201).json({ data: reservation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateReservation = async (req: Request, res: Response) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user?.organizationId },
      req.body,
      { new: true }
    );
    res.json({ data: reservation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  try {
    await Reservation.findOneAndDelete({ _id: req.params.id, organizationId: req.user?.organizationId });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
