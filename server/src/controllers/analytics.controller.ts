import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';
import Order from '../models/Order';
import Expense from '../models/Expense';
import MenuItem from '../models/MenuItem';
import Customer from '../models/Customer';
import Category from '../models/Category';

const getDateFilter = (req: Request) => {
  const { startDate, endDate } = req.query;
  const match: any = {};
  if (startDate && endDate) {
    const start = new Date(startDate as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
    match.createdAt = { $gte: start, $lte: end };
  }
  return match;
};

const getBaseMatch = (req: Request) => {
  const match: any = { organizationId: new mongoose.Types.ObjectId(req.user!.organizationId) };
  if (req.query.outletId) {
    match.outletId = new mongoose.Types.ObjectId(req.query.outletId as string);
  }
  return match;
};

export const getDashboardKPIs = asyncHandler(async (req: Request, res: Response) => {
  const match = getBaseMatch(req);
  const dateFilter = getDateFilter(req);
  const currentMatch = { ...match, ...dateFilter, status: 'COMPLETED' };
  
  let prevMatch = null;
  if (req.query.startDate && req.query.endDate) {
    const start = new Date(req.query.startDate as string);
    const end = new Date(req.query.endDate as string);
    const diff = end.getTime() - start.getTime();
    
    const prevEnd = new Date(start.getTime() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    
    const prevStart = new Date(prevEnd.getTime() - diff);
    prevStart.setHours(0, 0, 0, 0);
    
    prevMatch = { ...match, createdAt: { $gte: prevStart, $lte: prevEnd }, status: 'COMPLETED' };
  }

  const getMetrics = async (matchStage: any) => {
    const result = await Order.aggregate([
      { $match: matchStage },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          grandTotal: { $first: '$grandTotal' },
          subtotal: { $first: '$subtotal' },
          itemsCount: { $sum: '$items.quantity' },
          customerId: { $first: '$customer.phone' }
        }
      },
      {
        $group: {
          _id: null,
          grossSales: { $sum: '$grandTotal' },
          netSales: { $sum: '$subtotal' },
          ordersCount: { $sum: 1 },
          itemsSold: { $sum: '$itemsCount' },
          uniqueCustomersList: { $addToSet: '$customerId' }
        }
      }
    ]);
    
    const expenseDateFilter = matchStage.createdAt ? { date: matchStage.createdAt } : {};
    const expenseMatch = { ...match, ...expenseDateFilter };
    const expenseResult = await Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
    ]);
    
    const data = result[0] || { grossSales: 0, netSales: 0, ordersCount: 0, itemsSold: 0, uniqueCustomersList: [] };
    const expenses = expenseResult[0]?.totalExpense || 0;
    const uniqueCustomersList = data.uniqueCustomersList || [];
    const uniqueCustomers = uniqueCustomersList.filter((x: any) => x).length;
    
    return {
      grossSales: data.grossSales || 0,
      netSales: data.netSales || 0,
      ordersCount: data.ordersCount || 0,
      averageOrderValue: data.ordersCount > 0 ? data.grossSales / data.ordersCount : 0,
      itemsSold: data.itemsSold || 0,
      uniqueCustomers,
      profit: (data.grossSales || 0) - expenses
    };
  };

  const currentMetrics = await getMetrics(currentMatch);
  const prevMetrics = prevMatch ? await getMetrics(prevMatch) : null;
  
  res.json({ current: currentMetrics, previous: prevMetrics });
});

export const getSalesAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const match = { ...getBaseMatch(req), ...getDateFilter(req), status: 'COMPLETED' };
  
  const dailyTrend = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
        revenue: { $sum: "$grandTotal" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const orderTypeBreakdown = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$orderType",
        revenue: { $sum: "$grandTotal" },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const peakHours = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } },
        revenue: { $sum: "$grandTotal" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({ dailyTrend, orderTypeBreakdown, peakHours });
});

export const getProductAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const match = { ...getBaseMatch(req), ...getDateFilter(req), status: 'COMPLETED' };
  
  const topItems = await Order.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItemId",
        name: { $first: "$items.name" },
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.itemTotal" }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  
  const categoryBreakdown = await Order.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $lookup: {
        from: 'menuitems',
        localField: 'items.menuItemId',
        foreignField: '_id',
        as: 'menuItem'
      }
    },
    { $unwind: "$menuItem" },
    {
      $lookup: {
        from: 'categories',
        localField: 'menuItem.categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category._id",
        name: { $first: "$category.name" },
        revenue: { $sum: "$items.itemTotal" },
        quantity: { $sum: "$items.quantity" }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
  
  res.json({ topItems, categoryBreakdown });
});

export const getCustomerAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const match = { ...getBaseMatch(req), ...getDateFilter(req), status: 'COMPLETED' };
  
  const leaderboard = await Order.aggregate([
    { $match: match },
    { $match: { "customer.phone": { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$customer.phone",
        name: { $first: "$customer.name" },
        revenue: { $sum: "$grandTotal" },
        visits: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  
  const customersInPeriod = await Order.distinct("customer.phone", match);
  const returningCount = await Order.distinct("customer.phone", { 
    ...getBaseMatch(req), 
    status: 'COMPLETED',
    createdAt: { $lt: match.createdAt?.$gte || new Date() },
    "customer.phone": { $in: customersInPeriod }
  });
  
  const returning = returningCount.length;
  const newCustomers = Math.max(0, customersInPeriod.length - returning);
  
  res.json({ leaderboard, retention: { new: newCustomers, returning } });
});

export const getProfitAndLoss = asyncHandler(async (req: Request, res: Response) => {
  const match = { ...getBaseMatch(req), ...getDateFilter(req) };
  
  const revenueResult = await Order.aggregate([
    { $match: { ...match, status: 'COMPLETED' } },
    { $group: { _id: null, revenue: { $sum: '$subtotal' }, taxTotal: { $sum: '$taxTotal' }, grossSales: { $sum: '$grandTotal' } } }
  ]);
  
  const expenseDateFilter = match.createdAt ? { date: match.createdAt } : {};
  
  const expensesResult = await Expense.aggregate([
    { $match: { ...getBaseMatch(req), ...expenseDateFilter, status: { $ne: 'REJECTED' } } },
    { $group: { _id: null, amount: { $sum: '$amount' } } }
  ]);
  
  const purchaseDateFilter = match.createdAt ? { purchaseDate: match.createdAt } : {};
  const purchasesResult = await Purchase.aggregate([
    { $match: { ...getBaseMatch(req), ...purchaseDateFilter, status: { $ne: 'CANCELLED' } } },
    { $group: { _id: null, amount: { $sum: '$totalAmount' } } }
  ]);

  // Dynamic COGS Calculation based on recipes
  const ordersForCogs = await Order.find({ ...match, status: 'COMPLETED' }).lean();
  const allItems = await MenuItem.find({ organizationId: req.user!.organizationId }).lean();
  const allMaterials = await RawMaterial.find({ organizationId: req.user!.organizationId }).lean();
  
  const materialMap = new Map();
  allMaterials.forEach(m => materialMap.set(m._id.toString(), m.unitCost || 0));
  
  const itemCogsMap = new Map();
  allItems.forEach(item => {
    let cost = 0;
    if (item.recipe && Array.isArray(item.recipe)) {
      item.recipe.forEach(r => {
        const unitCost = materialMap.get(r.rawMaterialId?.toString()) || 0;
        cost += unitCost * (r.quantity || 0);
      });
    }
    itemCogsMap.set(item._id.toString(), cost);
  });
  
  let computedCogs = 0;
  ordersForCogs.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const itemCost = itemCogsMap.get(item.menuItemId?.toString()) || 0;
        computedCogs += itemCost * (item.quantity || 1);
      });
    }
  });
  
  const grossSales = revenueResult[0]?.grossSales || 0;
  const revenue = revenueResult[0]?.revenue || 0;
  const taxes = revenueResult[0]?.taxTotal || 0;
  const expenses = expensesResult[0]?.amount || 0;
  const purchases = purchasesResult[0]?.amount || 0;
  
  const cogs = computedCogs; // Approximation for restaurant until full recipe deduction is live
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;
  
  res.json({ grossSales, revenue, cogs, purchases, expenses, taxes, grossProfit, netProfit });
});

export const getGSTReport = asyncHandler(async (req: Request, res: Response) => {
  const match = { ...getBaseMatch(req), ...getDateFilter(req), status: 'COMPLETED' };
  
  const gstReport = await Order.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $lookup: {
        from: 'menuitems',
        localField: 'items.menuItemId',
        foreignField: '_id',
        as: 'menuItem'
      }
    },
    { $unwind: { path: "$menuItem", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$menuItem.hsnCode", "UNKNOWN"] },
        revenue: { $sum: "$items.itemTotal" },
        totalTax: {
          $sum: { 
            $multiply: [
              "$items.itemTotal", 
              { $divide: [{ $ifNull: ["$menuItem.taxRate", 5] }, 100] }
            ] 
          }
        }
      }
    },
    {
      $project: {
        hsnCode: "$_id",
        _id: 0,
        revenue: 1,
        totalTax: 1,
        cgst: { $divide: ["$totalTax", 2] },
        sgst: { $divide: ["$totalTax", 2] }
      }
    },
    { $sort: { hsnCode: 1 } }
  ]);
  
  res.json(gstReport);
});

export const getAIInsights = asyncHandler(async (req: Request, res: Response) => {
  const match = { ...getBaseMatch(req), ...getDateFilter(req), status: 'COMPLETED' };
  const insights: string[] = [];
  
  const topItem = await Order.aggregate([
    { $match: match },
    { $unwind: "$items" },
    { $group: { _id: "$items.name", revenue: { $sum: "$items.itemTotal" } } },
    { $sort: { revenue: -1 } },
    { $limit: 1 }
  ]);
  
  if (topItem.length > 0) {
    insights.push(`${topItem[0]._id} generated the highest revenue this period.`);
  }
  
  const orderTypes = await Order.aggregate([
    { $match: match },
    { $group: { _id: "$orderType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
  
  if (orderTypes.length > 0) {
    insights.push(`${orderTypes[0]._id} is the most popular order type.`);
  }
  
  res.json({ insights });
});
