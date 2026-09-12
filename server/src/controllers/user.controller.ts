import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { PERMISSIONS } from '../utils/permissions';

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find({ organizationId: req.user!.organizationId }).populate('roleId');
  return successResponse(res, users);
};

export const getUser = async (req: Request, res: Response) => {
  if (req.params.id !== req.user!.userId && !req.user!.permissions.includes(PERMISSIONS.STAFF_VIEW)) {
    return errorResponse(res, 'Forbidden', 403);
  }
  const user = await User.findOne({ _id: req.params.id, organizationId: req.user!.organizationId }).populate('roleId');
  if (!user) return errorResponse(res, 'User not found', 404);
  return successResponse(res, user);
};

export const createUser = async (req: Request, res: Response) => {
  const { password, ...rest } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = new User({
    ...rest,
    passwordHash,
    organizationId: req.user!.organizationId,
  });
  await user.save();
  const userObj = user.toObject();
  delete (userObj as any).passwordHash;
  return successResponse(res, userObj, 'User created', 201);
};

export const updateUser = async (req: Request, res: Response) => {
  const { password, ...rest } = req.body;
  if (password) {
    rest.passwordHash = await bcrypt.hash(password, 12);
  }
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: rest },
    { new: true, runValidators: true }
  );
  if (!user) return errorResponse(res, 'User not found', 404);
  return successResponse(res, user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: { active: false } },
    { new: true }
  );
  if (!user) return errorResponse(res, 'User not found', 404);
  return successResponse(res, user, 'User deactivated');
};
