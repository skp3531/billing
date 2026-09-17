import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';
import CashRegister from '../models/CashRegister';
import Order from '../models/Order';
import Expense from '../models/Expense';
import { errorResponse, successResponse } from '../utils/apiResponse';

export const getCurrentRegister = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const outletId = req.query.outletId || req.headers['x-outlet-id'];
  
  const register = await CashRegister.findOne({
    organizationId,
    outletId,
    status: 'OPEN'
  }).populate('openedBy', 'name email');

  return successResponse(res, register);
});

export const openRegister = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, userId } = req.user!;
  const outletId = req.query.outletId || req.headers['x-outlet-id'];
  const { openingBalance, notes } = req.body;

  // Check if one is already open
  const existing = await CashRegister.findOne({
    organizationId,
    outletId,
    status: 'OPEN'
  });

  if (existing) {
    return errorResponse(res, 'A register is already open for this outlet', 400);
  }

  const register = await CashRegister.create({
    organizationId,
    outletId,
    openedBy: userId,
    openingBalance: Number(openingBalance) || 0,
    notes,
    status: 'OPEN'
  });

  return successResponse(res, register, 'Register opened successfully', 201);
});

export const closeRegister = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, userId } = req.user!;
  const outletId = req.query.outletId || req.headers['x-outlet-id'];
  const { closingBalance, notes } = req.body;

  const register = await CashRegister.findOne({
    organizationId,
    outletId,
    status: 'OPEN'
  });

  if (!register) {
    return errorResponse(res, 'No open register found', 404);
  }

  // Calculate actual sales during this register's lifetime
  const orders = await Order.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId as string),
        outletId: new mongoose.Types.ObjectId(outletId as string),
        createdAt: { $gte: register.openedAt },
        status: 'COMPLETED',
        paymentMethod: 'CASH'
      }
    },
    {
      $group: {
        _id: null,
        totalCashSales: { $sum: '$grandTotal' }
      }
    }
  ]);

  const expenses = await Expense.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId as string),
        outletId: new mongoose.Types.ObjectId(outletId as string),
        createdAt: { $gte: register.openedAt },
        paymentMethod: 'CASH'
      }
    },
    {
      $group: {
        _id: null,
        totalCashOut: { $sum: '$amount' }
      }
    }
  ]);

  const totalCashSales = orders.length > 0 ? orders[0].totalCashSales : 0;
  const totalCashOut = expenses.length > 0 ? expenses[0].totalCashOut : 0;
  const totalCashIn = register.totalCashIn || 0; // if manual cash drops were made

  const expectedBalance = register.openingBalance + totalCashSales + totalCashIn - totalCashOut;
  const actualClosingBalance = Number(closingBalance) || 0;
  const difference = actualClosingBalance - expectedBalance;

  register.status = 'CLOSED';
  register.closedBy = userId as any;
  register.closedAt = new Date();
  register.totalCashSales = totalCashSales;
  register.totalCashOut = totalCashOut;
  register.expectedBalance = expectedBalance;
  register.closingBalance = actualClosingBalance;
  register.difference = difference;
  
  if (notes) {
    register.notes = register.notes ? `${register.notes}\nClose Notes: ${notes}` : notes;
  }

  await register.save();

  return successResponse(res, register, 'Register closed successfully');
});

export const getRegisterHistory = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const outletId = req.query.outletId || req.headers['x-outlet-id'];
  
  const history = await CashRegister.find({
    organizationId,
    outletId,
    status: 'CLOSED'
  })
  .populate('openedBy', 'name')
  .populate('closedBy', 'name')
  .sort({ closedAt: -1 })
  .limit(50);

  return successResponse(res, history);
});
