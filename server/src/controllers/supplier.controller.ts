import { Request, Response } from 'express';
import Supplier from '../models/Supplier';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getSuppliers = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const suppliers = await Supplier.find({ organizationId, active: true }).sort({ name: 1 });
  return successResponse(res, suppliers, 'Suppliers fetched successfully');
};

export const createSupplier = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const supplier = await Supplier.create({ ...req.body, organizationId });
  return successResponse(res, supplier, 'Supplier created successfully', 201);
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const supplier = await Supplier.findOneAndUpdate(
    { _id: id, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!supplier) return errorResponse(res, 'Supplier not found', 404);
  return successResponse(res, supplier, 'Supplier updated successfully');
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const supplier = await Supplier.findOneAndUpdate(
    { _id: id, organizationId },
    { active: false },
    { new: true }
  );

  if (!supplier) return errorResponse(res, 'Supplier not found', 404);
  return successResponse(res, null, 'Supplier deleted successfully');
};
