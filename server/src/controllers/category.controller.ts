import { Request, Response } from 'express';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getCategories = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const categories = await Category.find({ organizationId }).sort({ sortOrder: 1 });
  return successResponse(res, categories, 'Categories fetched successfully');
};

export const createCategory = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const category = await Category.create({ ...req.body, organizationId });
  return successResponse(res, category, 'Category created successfully', 201);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const category = await Category.findOneAndUpdate(
    { _id: id, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    return errorResponse(res, 'Category not found', 404);
  }

  return successResponse(res, category, 'Category updated successfully');
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const category = await Category.findOneAndUpdate(
    { _id: id, organizationId },
    { active: false },
    { new: true }
  );

  if (!category) {
    return errorResponse(res, 'Category not found', 404);
  }

  return successResponse(res, null, 'Category deleted successfully');
};
