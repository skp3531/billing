import { Request, Response } from 'express';
import Expense from '../models/Expense';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getExpenses = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const expenses = await Expense.find({ organizationId }).sort({ date: -1 });
  return successResponse(res, expenses, 'Expenses fetched successfully');
};

export const createExpense = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const expense = await Expense.create({ ...req.body, organizationId });
  return successResponse(res, expense, 'Expense created successfully', 201);
};

export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const expense = await Expense.findOneAndUpdate(
    { _id: id, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!expense) {
    return errorResponse(res, 'Expense not found', 404);
  }

  return successResponse(res, expense, 'Expense updated successfully');
};

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const expense = await Expense.findOneAndDelete({ _id: id, organizationId });

  if (!expense) {
    return errorResponse(res, 'Expense not found', 404);
  }

  return successResponse(res, null, 'Expense deleted successfully');
};
