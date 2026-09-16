import { Request, Response } from 'express';
import Expense from '../models/Expense';
import ExpenseCategory from '../models/ExpenseCategory';
import ExpenseBudget from '../models/ExpenseBudget';
import Order from '../models/Order'; // for revenue
import { successResponse, errorResponse } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/asyncHandler';
import mongoose from 'mongoose';

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const expenses = await Expense.find({ organizationId })
    .populate('categoryId')
    .populate('supplierId')
    .sort({ date: -1 });
  return successResponse(res, expenses, 'Expenses fetched successfully');
});

export const getCommandCenter = asyncHandler(async (req: Request, res: Response) => {
  const orgId = new mongoose.Types.ObjectId(req.user!.organizationId);
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // 1. Fetch Expenses
  const allExpenses = await Expense.find({ organizationId: orgId }).populate('categoryId').lean();
  
  let todayTotal = 0, weekTotal = 0, monthTotal = 0, yearTotal = 0, lastMonthTotal = 0;
  let pendingApprovals = 0;
  const categoryTotals: Record<string, number> = {};

  allExpenses.forEach(exp => {
    const d = new Date(exp.date);
    const amt = exp.totalAmount || exp.amount || 0;
    
    if (d >= startOfToday) todayTotal += amt;
    if (d >= startOfWeek) weekTotal += amt;
    if (d >= startOfMonth) {
      monthTotal += amt;
      const catName = exp.categoryString || (exp.categoryId as any)?.name || 'Uncategorized';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + amt;
    }
    if (d >= startOfYear) yearTotal += amt;
    if (d >= startOfLastMonth && d <= endOfLastMonth) lastMonthTotal += amt;
    
    if (exp.status === 'PENDING_APPROVAL') pendingApprovals++;
  });

  // Calculate Growth
  const growthPercent = lastMonthTotal > 0 ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  // 2. Budgets
  const budgets = await ExpenseBudget.find({ organizationId: orgId }).populate('categoryId').lean();
  const budgetVsActual = budgets.map(b => {
    const catName = (b.categoryId as any)?.name || 'Unknown';
    const actual = categoryTotals[catName] || 0;
    return {
      category: catName,
      budget: b.amount,
      actual,
      variance: b.amount - actual,
      percentUsed: b.amount > 0 ? (actual / b.amount) * 100 : 0
    };
  });

  // 3. Profit Impact (Revenue)
  const orders = await Order.find({ 
    organizationId: orgId, 
    status: 'COMPLETED',
    createdAt: { $gte: startOfMonth }
  }).lean();
  
  const revenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const netProfit = revenue - monthTotal;
  const expenseRatio = revenue > 0 ? (monthTotal / revenue) * 100 : 0;

  // 4. Trend Analysis (Last 7 days)
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayStart = new Date(d.setHours(0,0,0,0));
    const dayEnd = new Date(d.setHours(23,59,59,999));
    
    const dayTotal = allExpenses.filter(e => {
      const ed = new Date(e.date);
      return ed >= dayStart && ed <= dayEnd;
    }).reduce((sum, e) => sum + (e.totalAmount || e.amount || 0), 0);
    
    trendData.push({
      date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayTotal
    });
  }

  // Cost Efficiency Score (Dummy logic for now)
  const costEfficiencyScore = Math.max(0, 100 - (growthPercent > 0 ? growthPercent : 0));

  res.json({
    success: true,
    data: {
      kpis: {
        todayTotal,
        weekTotal,
        monthTotal,
        yearTotal,
        growthPercent,
        pendingApprovals
      },
      budgetVsActual,
      profitImpact: {
        revenue,
        expenses: monthTotal,
        netProfit,
        expenseRatio
      },
      trendData,
      categoryData: Object.entries(categoryTotals).map(([name, value]) => ({ name, value })),
      costEfficiencyScore
    }
  });
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const count = await Expense.countDocuments({ organizationId });
  
  const payload = {
    ...req.body,
    organizationId,
    expenseNumber: req.body.expenseNumber || `EXP-${1000 + count + 1}`,
    status: req.body.status || 'PAID',
    totalAmount: req.body.amount + (req.body.taxAmount || 0)
  };

  const expense = await Expense.create(payload);
  return successResponse(res, expense, 'Expense created successfully', 201);
});

export const updateExpenseStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  
  const expense = await Expense.findOneAndUpdate(
    { _id: id, organizationId },
    { status: req.body.status },
    { new: true }
  );

  if (!expense) return errorResponse(res, 'Expense not found', 404);
  return successResponse(res, expense, 'Expense status updated');
});

// Categories & Budgets
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const cats = await ExpenseCategory.find({ organizationId: req.user!.organizationId, active: true });
  return successResponse(res, cats, 'Categories fetched');
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await ExpenseCategory.create({ ...req.body, organizationId: req.user!.organizationId });
  return successResponse(res, cat, 'Category created');
});

export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  const budgets = await ExpenseBudget.find({ organizationId: req.user!.organizationId }).populate('categoryId');
  return successResponse(res, budgets, 'Budgets fetched');
});

export const createBudget = asyncHandler(async (req: Request, res: Response) => {
  const budget = await ExpenseBudget.create({ ...req.body, organizationId: req.user!.organizationId });
  return successResponse(res, budget, 'Budget created');
});
