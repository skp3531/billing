import { Request, Response } from 'express';
import Waitlist from '../models/Waitlist';

export const getWaitlist = async (req: Request, res: Response) => {
  try {
    const waitlist = await Waitlist.find({ organizationId: req.user?.organizationId, status: { $ne: 'LEFT' } }).sort({ createdAt: 1 });
    res.json({ data: waitlist });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createWaitlistEntry = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, organizationId: req.user?.organizationId };
    const entry = await Waitlist.create(data);
    res.status(201).json({ data: entry });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateWaitlistEntry = async (req: Request, res: Response) => {
  try {
    const entry = await Waitlist.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user?.organizationId },
      req.body,
      { new: true }
    );
    res.json({ data: entry });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWaitlistEntry = async (req: Request, res: Response) => {
  try {
    await Waitlist.findOneAndDelete({ _id: req.params.id, organizationId: req.user?.organizationId });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
