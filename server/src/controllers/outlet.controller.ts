import { Request, Response } from 'express';
import { Outlet } from '../models/Outlet';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getOutlets = async (req: Request, res: Response) => {
  const outlets = await Outlet.find({ organizationId: req.user!.organizationId });
  return successResponse(res, outlets);
};

export const getOutlet = async (req: Request, res: Response) => {
  const outlet = await Outlet.findOne({ _id: req.params.id, organizationId: req.user!.organizationId });
  if (!outlet) return errorResponse(res, 'Outlet not found', 404);
  return successResponse(res, outlet);
};

export const createOutlet = async (req: Request, res: Response) => {
  const outlet = new Outlet({
    ...req.body,
    organizationId: req.user!.organizationId,
  });
  await outlet.save();
  return successResponse(res, outlet, 'Outlet created', 201);
};

export const updateOutlet = async (req: Request, res: Response) => {
  const outlet = await Outlet.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!outlet) return errorResponse(res, 'Outlet not found', 404);
  return successResponse(res, outlet);
};
