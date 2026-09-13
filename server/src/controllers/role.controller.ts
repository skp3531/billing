import { Request, Response } from 'express';
import { Role } from '../models/Role';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getRoles = async (req: Request, res: Response) => {
  const roles = await Role.find({ organizationId: req.user!.organizationId });
  return successResponse(res, roles);
};

export const getRole = async (req: Request, res: Response) => {
  const role = await Role.findOne({ _id: req.params.id, organizationId: req.user!.organizationId });
  if (!role) return errorResponse(res, 'Role not found', 404);
  return successResponse(res, role);
};

export const createRole = async (req: Request, res: Response) => {
  const role = new Role({
    ...req.body,
    organizationId: req.user!.organizationId,
    isSystem: false,
  });
  await role.save();
  return successResponse(res, role, 'Role created', 201);
};

export const updateRole = async (req: Request, res: Response) => {
  const role = await Role.findOne({ _id: req.params.id, organizationId: req.user!.organizationId });
  if (!role) return errorResponse(res, 'Role not found', 404);
  // Allow modifying system roles now as requested by user
  // if (role.isSystem) return errorResponse(res, 'Cannot modify system role', 400);
  Object.assign(role, req.body);
  await role.save();
  return successResponse(res, role);
};
