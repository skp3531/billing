import { Request, Response } from 'express';
import RawMaterial from '../models/RawMaterial';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getRawMaterials = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const materials = await RawMaterial.find({ organizationId, active: true }).sort({ name: 1 });
  return successResponse(res, materials, 'Raw materials fetched successfully');
};

export const createRawMaterial = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const material = await RawMaterial.create({ ...req.body, organizationId });
  return successResponse(res, material, 'Raw material created successfully', 201);
};

export const updateRawMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const material = await RawMaterial.findOneAndUpdate(
    { _id: id, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!material) return errorResponse(res, 'Raw material not found', 404);
  return successResponse(res, material, 'Raw material updated successfully');
};

export const deleteRawMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const material = await RawMaterial.findOneAndUpdate(
    { _id: id, organizationId },
    { active: false },
    { new: true }
  );

  if (!material) return errorResponse(res, 'Raw material not found', 404);
  return successResponse(res, null, 'Raw material deleted successfully');
};
