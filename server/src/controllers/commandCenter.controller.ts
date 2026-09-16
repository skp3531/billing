import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Expense from '../models/Expense';
import MenuItem from '../models/MenuItem';
import Customer from '../models/Customer';
import RawMaterial from '../models/RawMaterial';
import Table from '../models/Table';
import Waitlist from '../models/Waitlist';
import Purchase from '../models/Purchase';

// Helper to get start and end dates based on filter type
const getDateRange = (filter: string, customStart?: string, customEnd?: string) => {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  let prevStart = new Date(now);
  let prevEnd = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (filter) {
    case 'today':
      prevStart.setDate(start.getDate() - 1);
      prevEnd.setDate(end.getDate() - 1);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      prevStart.setDate(start.getDate() - 1);
      prevEnd.setDate(end.getDate() - 1);
      break;
    case 'last7days':
      start.setDate(start.getDate() - 7);
      prevStart.setDate(start.getDate() - 7);
      prevEnd.setDate(start.getDate() - 1);
      break;
    case 'last30days':
      start.setDate(start.getDate() - 30);
      prevStart.setDate(start.getDate() - 30);
      prevEnd.setDate(start.getDate() - 1);
      break;
    case 'thisMonth':
      start.setDate(1);
      prevStart.setMonth(start.getMonth() - 1);
      prevStart.setDate(1);
      prevEnd = new Date(start.getTime() - 1);
      break;
    case 'custom':
      if (customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
        const diff = end.getTime() - start.getTime();
        prevStart = new Date(start.getTime() - diff);
        prevEnd = new Date(start.getTime() - 1);
      }
      break;
  }
  
  prevStart.setHours(0,0,0,0);
  prevEnd.setHours(23,59,59,999);
  
  return { start, end, prevStart, prevEnd };
};

const calcGrowth = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getCommandCenterData = async (req: Request, res: Response) => {
  try {
    const orgId = new mongoose.Types.ObjectId(req.user!.organizationId);
    const outletMatch = req.query.outletId ? { outletId: new mongoose.Types.ObjectId(req.query.outletId as string) } : {};
    const baseMatch = { organizationId: orgId, ...outletMatch };
    
    const filter = (req.query.filter as string) || 'today';
    const { start, end, prevStart, prevEnd } = getDateRange(filter, req.query.startDate as string, req.query.endDate as string);

    const currentPeriodMatch = { ...baseMatch, createdAt: { $gte: start, $lte: end } };
    const prevPeriodMatch = { ...baseMatch, createdAt: { $gte: prevStart, $lte: prevEnd } };

    // 1. Executive KPIs
    const [currentOrders, prevOrders, currentExpenses, prevExpenses, allTables, lowStockCount, inventoryTotal] = await Promise.all([
      Order.find(currentPeriodMatch),
      Order.find(prevPeriodMatch),
      Expense.find(currentPeriodMatch),
      Expense.find(prevPeriodMatch),
      Table.find(baseMatch),
      RawMaterial.countDocuments({ ...baseMatch, $expr: { $lte: ['$currentStock', '$minStockLevel'] } }),
      RawMaterial.aggregate([
        { $match: baseMatch },
        { $group: { _id: null, totalValue: { $sum: { $multiply: ['$currentStock', '$unitCost'] } } } }
      ])
    ]);

    // Current KPIs
    const currGross = currentOrders.reduce((sum, o) => sum + (o.subtotal || o.grandTotal), 0);
    const currNet = currentOrders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.grandTotal, 0);
    const currCount = currentOrders.length;
    const currAOV = currCount > 0 ? currNet / currCount : 0;
    const currDiscounts = currentOrders.reduce((sum, o) => sum + (o.discountTotal || 0), 0);
    const currExpTotal = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currProfit = currNet - currExpTotal; // Simplified, ideally COGS included

    // Prev KPIs
    const prevGross = prevOrders.reduce((sum, o) => sum + (o.subtotal || o.grandTotal), 0);
    const prevNet = prevOrders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.grandTotal, 0);
    const prevCount = prevOrders.length;
    const prevAOV = prevCount > 0 ? prevNet / prevCount : 0;
    const prevDiscounts = prevOrders.reduce((sum, o) => sum + (o.discountTotal || 0), 0);
    const prevExpTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevProfit = prevNet - prevExpTotal;

    const kpis = {
      grossSales: { value: currGross, prev: prevGross, growth: calcGrowth(currGross, prevGross) },
      netSales: { value: currNet, prev: prevNet, growth: calcGrowth(currNet, prevNet) },
      orders: { value: currCount, prev: prevCount, growth: calcGrowth(currCount, prevCount) },
      aov: { value: currAOV, prev: prevAOV, growth: calcGrowth(currAOV, prevAOV) },
      discounts: { value: currDiscounts, prev: prevDiscounts, growth: calcGrowth(currDiscounts, prevDiscounts) },
      expenses: { value: currExpTotal, prev: prevExpTotal, growth: calcGrowth(currExpTotal, prevExpTotal) },
      profit: { value: currProfit, prev: prevProfit, growth: calcGrowth(currProfit, prevProfit) },
      inventoryValue: inventoryTotal[0]?.totalValue || 0,
      activeTables: allTables.filter(t => t.status === 'OCCUPIED').length,
    };

    // 2. Business Health Score (0-100)
    let healthScore = 100;
    if (kpis.netSales.growth < 0) healthScore -= 10;
    if (kpis.profit.growth < 0) healthScore -= 15;
    if (lowStockCount > 5) healthScore -= 5;
    if (kpis.activeTables === 0 && allTables.length > 0) healthScore -= 5; // empty floor
    const healthStatus = healthScore >= 80 ? 'Good' : healthScore >= 60 ? 'Warning' : 'Critical';

    // 3. Live Order Monitor
    const orderMonitor = {
      running: currentOrders.filter(o => ['PENDING', 'PREPARING'].includes(o.status)).length,
      preparing: currentOrders.filter(o => o.status === 'PREPARING').length,
      ready: currentOrders.filter(o => false).length,
      completed: currentOrders.filter(o => o.status === 'COMPLETED').length,
      cancelled: currentOrders.filter(o => o.status === 'CANCELLED').length,
    };

    // 4. Payment Methods
    const paymentMethods = currentOrders.reduce((acc: any, o) => {
      const pm = o.paymentMethod || 'Cash';
      acc[pm] = (acc[pm] || 0) + o.grandTotal;
      return acc;
    }, {});

    // 5. Category Performance
    // To do this properly, we'd need to aggregate Order Items. Doing it in memory for speed on filtered orders.
    const categorySales: any = {};
    const itemSales: any = {};
    currentOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const cat = item.category || 'Uncategorized';
        const name = item.name;
        
        if (!categorySales[cat]) categorySales[cat] = { sales: 0, qty: 0 };
        categorySales[cat].sales += (item.price * item.quantity);
        categorySales[cat].qty += item.quantity;
        
        if (!itemSales[name]) itemSales[name] = { name, revenue: 0, qty: 0 };
        itemSales[name].revenue += (item.price * item.quantity);
        itemSales[name].qty += item.quantity;
      });
    });

    const topItems = Object.values(itemSales).sort((a: any, b: any) => b.qty - a.qty).slice(0, 10);
    const lowItems = Object.values(itemSales).sort((a: any, b: any) => a.qty - b.qty).slice(0, 10);

    // 6. AI Insights (Rule-based generation)
    const insights = [];
    if (topItems.length > 0) insights.push(`"${(topItems[0] as any).name}" generated highest revenue today.`);
    if (kpis.netSales.growth < 0) insights.push(`Sales dropped ${Math.abs(kpis.netSales.growth)}% compared to previous period.`);
    else if (kpis.netSales.growth > 0) insights.push(`Sales grew ${kpis.netSales.growth}% compared to previous period!`);
    if (lowStockCount > 0) insights.push(`Inventory Alert: ${lowStockCount} items are running below minimum stock levels.`);
    if (kpis.profit.growth > 0) insights.push(`Profit margin improved by ${kpis.profit.growth}%.`);

    res.json({
      success: true,
      data: {
        kpis,
        health: { score: healthScore, status: healthStatus },
        orderMonitor,
        paymentMethods,
        categorySales,
        topItems,
        lowItems,
        insights,
        tableSummary: {
          total: allTables.length,
          occupied: allTables.filter(t => t.status === 'OCCUPIED').length,
          available: allTables.filter(t => t.status === 'AVAILABLE').length,
          reserved: allTables.filter(t => t.status === 'RESERVED').length,
          cleaning: allTables.filter(t => t.status === 'CLEANING').length,
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
