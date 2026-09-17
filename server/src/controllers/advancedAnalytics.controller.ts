import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';
import Order from '../models/Order';
import Customer from '../models/Customer';
import MenuItem from '../models/MenuItem';

const getBaseMatch = (req: Request) => {
  const match: any = { organizationId: new mongoose.Types.ObjectId(req.user!.organizationId) };
  if (req.query.outletId) {
    match.outletId = new mongoose.Types.ObjectId(req.query.outletId as string);
  }
  return match;
};

// Menu Engineering (Stars, Cash Cows, Dogs, Question Marks)
export const getMenuEngineering = asyncHandler(async (req: Request, res: Response) => {
  const match = getBaseMatch(req);
  
  // Aggregate sales by item
  const sales = await Order.aggregate([
    { $match: { ...match, status: 'COMPLETED' } },
    { $unwind: '$items' },
    { $group: {
      _id: '$items.menuItem',
      totalQuantity: { $sum: '$items.quantity' },
      revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
    }}
  ]);

  const items = await MenuItem.find({ organizationId: match.organizationId });
  
  let totalVol = 0;
  let totalMargin = 0;
  
  const mapped = items.map(item => {
    const sale = sales.find(s => s._id.toString() === item._id.toString());
    const volume = sale ? sale.totalQuantity : 0;
    const rev = sale ? sale.revenue : 0;
    // Mocking cost if missing (assuming 30% cost)
    const cost = item.basePrice * 0.3; 
    const margin = item.basePrice - cost;
    
    totalVol += volume;
    totalMargin += margin;
    
    return {
      id: item._id,
      name: item.name,
      category: item.categoryId,
      volume,
      revenue: rev,
      margin
    };
  });

  const avgVol = mapped.length ? totalVol / mapped.length : 0;
  const avgMargin = mapped.length ? totalMargin / mapped.length : 0;

  const categorized = mapped.map(item => {
    let category = 'DOG';
    if (item.volume >= avgVol && item.margin >= avgMargin) category = 'STAR';
    else if (item.volume < avgVol && item.margin >= avgMargin) category = 'CASH_COW';
    else if (item.volume >= avgVol && item.margin < avgMargin) category = 'QUESTION_MARK';
    
    return { ...item, quadrant: category };
  });

  res.json({ success: true, data: categorized });
});

export const getBusinessHealth = asyncHandler(async (req: Request, res: Response) => {
  // A simplistic health score calculation
  const score = 87; // MOCK for now
  res.json({
    success: true,
    data: {
      score,
      metrics: {
        salesGrowth: 15,
        profitMargin: 22,
        customerRetention: 45,
        foodCost: 28
      }
    }
  });
});
