import { Request, Response } from 'express';
import Reservation from '../models/Reservation';
import Waitlist from '../models/Waitlist';
import { successResponse, errorResponse } from '../utils/apiResponse';

// --- RESERVATIONS ---

export const getReservations = async (req: Request, res: Response) => {
  const { date } = req.query;
  const match: any = { organizationId: req.user!.organizationId };
  
  if (date) {
    const start = new Date(date as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date as string);
    end.setHours(23, 59, 59, 999);
    match.reservationDate = { $gte: start, $lte: end };
  }
  
  const reservations = await Reservation.find(match).populate('tableId').sort({ reservationDate: 1, timeSlot: 1 });
  return successResponse(res, reservations);
};

export const createReservation = async (req: Request, res: Response) => {
  const reservation = new Reservation({
    ...req.body,
    organizationId: req.user!.organizationId,
  });
  await reservation.save();
  return successResponse(res, reservation, 'Reservation created', 201);
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  const { status, tableId } = req.body;
  const updateData: any = { status };
  if (tableId) updateData.tableId = tableId;

  const reservation = await Reservation.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: updateData },
    { new: true }
  ).populate('tableId');
  
  if (!reservation) return errorResponse(res, 'Reservation not found', 404);
  return successResponse(res, reservation, 'Reservation updated');
};

// --- WAITLIST ---

export const getWaitlist = async (req: Request, res: Response) => {
  // Only get today's active waitlist
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const waitlist = await Reservation.db.model('Waitlist').find({
    organizationId: req.user!.organizationId,
    createdAt: { $gte: start },
    status: { $in: ['WAITING', 'NOTIFIED'] }
  }).sort({ createdAt: 1 });
  
  return successResponse(res, waitlist);
};

export const addToWaitlist = async (req: Request, res: Response) => {
  const waitlist = new Waitlist({
    ...req.body,
    organizationId: req.user!.organizationId,
  });
  await waitlist.save();
  return successResponse(res, waitlist, 'Added to waitlist', 201);
};

export const updateWaitlistStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const waitlist = await Waitlist.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: { status } },
    { new: true }
  );
  if (!waitlist) return errorResponse(res, 'Waitlist entry not found', 404);
  return successResponse(res, waitlist, 'Waitlist updated');
};
