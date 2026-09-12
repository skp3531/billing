import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';


const parseDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { $gte: start, $lte: end };
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { organizationId } = req.user;
    
    // Get start and end of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Filter by organization, today, and completed status for revenue
    const matchStage = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ['COMPLETED', 'PENDING', 'PREPARING'] } // count non-cancelled for total orders maybe
    };

    const completedMatchStage = {
      ...matchStage,
      status: { $in: ['COMPLETED', 'PENDING', 'PREPARING'] }
    };

    // Aggregate for total orders and revenue today
    const todayStats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$grandTotal', 0]
            }
          }
        }
      }
    ]);

    // Top selling items today
    const topItems = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.itemTotal' }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      metrics: {
        todayRevenue: todayStats[0]?.totalRevenue || 0,
        todayOrders: todayStats[0]?.totalOrders || 0,
      },
      topItems
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching dashboard metrics', error: error.message });
  }
};

export const getReportData = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { organizationId } = req.user;
    const { startDate, endDate } = req.query;

    const query: any = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      status: 'COMPLETED'
    };

    const dateRange = parseDateRange(startDate as string, endDate as string);
    if (dateRange) query.createdAt = dateRange;

    // Group by date (YYYY-MM-DD)
    const dailyStats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          ordersCount: { $sum: 1 },
          revenue: { $sum: "$grandTotal" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(dailyStats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching report data', error: error.message });
  }
};

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { organizationId } = req.user;
    
    const RawMaterial = mongoose.model('RawMaterial');
    const inventory = await RawMaterial.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }).select('name currentStock minStockLevel unit unitCost');

    res.json({ inventory });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching inventory report', error: error.message });
  }
};

export const getProfitLossReport = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { organizationId } = req.user;
    const { startDate, endDate } = req.query;

    const query: any = {
      organizationId: new mongoose.Types.ObjectId(organizationId)
    };

    const dateRange = parseDateRange(startDate as string, endDate as string);
    if (dateRange) query.createdAt = dateRange;

    const orderQuery = { ...query, status: 'COMPLETED' };
    const orders = await Order.aggregate([
      { $match: orderQuery },
      { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
    ]);
    const totalRevenue = orders[0]?.totalRevenue || 0;

    const Expense = mongoose.model('Expense');
    const expenseQuery = { ...query };
    const expDateRange = parseDateRange(startDate as string, endDate as string);
    if (expDateRange) { expenseQuery.date = expDateRange; delete expenseQuery.createdAt; }
    const expenses = await Expense.aggregate([
      { $match: expenseQuery },
      { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
    ]);
    const totalExpense = expenses[0]?.totalExpense || 0;

    const Purchase = mongoose.model('Purchase');
    const purchaseQuery = { ...query, status: 'COMPLETED' };
    if (startDate && endDate) {
      purchaseQuery.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
      delete purchaseQuery.createdAt;
    }
    const purchases = await Purchase.aggregate([
      { $match: purchaseQuery },
      { $group: { _id: null, totalPurchase: { $sum: '$totalAmount' } } }
    ]);
    const totalPurchase = purchases[0]?.totalPurchase || 0;

    const netProfit = totalRevenue - totalExpense - totalPurchase;

    res.json({
      totalRevenue,
      totalExpense,
      totalPurchase,
      netProfit
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profit loss report', error: error.message });
  }
};


export const getAdvancedReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { organizationId } = req.user;
    const { startDate, endDate } = req.query;

    const query: any = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      status: 'COMPLETED'
    };
    
    const dateRange = parseDateRange(startDate as string, endDate as string);
    if (dateRange) query.createdAt = dateRange;

    // Payment Methods
    const paymentMethods = await Order.aggregate([
      { $match: query },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$grandTotal" } } },
      { $sort: { revenue: -1 } }
    ]);

    // Top Selling Items (all time in range)
    const topItems = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.itemTotal" } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({ paymentMethods, topItems });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching advanced reports', error: error.message });
  }
};
