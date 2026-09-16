import { Request, Response } from 'express';
import Purchase from '../models/Purchase';
import RawMaterial from '../models/RawMaterial';
import Supplier from '../models/Supplier';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/asyncHandler';
import mongoose from 'mongoose';

export const getPurchases = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const purchases = await Purchase.find({ organizationId })
    .populate('supplierId')
    .populate('items.rawMaterialId')
    .sort({ date: -1 });
  return successResponse(res, purchases, 'Purchases fetched successfully');
});

export const getProcurementAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const orgId = new mongoose.Types.ObjectId(req.user!.organizationId);
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthPurchases, allPurchases, suppliers, materials] = await Promise.all([
    Purchase.find({ organizationId: orgId, date: { $gte: firstDayOfMonth } }).lean(),
    Purchase.find({ organizationId: orgId }).populate('supplierId').lean(),
    Supplier.find({ organizationId: orgId }).lean(),
    RawMaterial.find({ organizationId: orgId }).lean(),
  ]);

  const totalPurchasesMonth = monthPurchases.reduce((acc, p) => acc + (p.grandTotal || 0), 0);
  const pendingOrders = allPurchases.filter(p => ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(p.status)).length;
  
  const outstandingPayables = suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
  
  const deliveriesExpectedToday = allPurchases.filter(p => {
    if (!p.deliveryDate || ['RECEIVED', 'CANCELLED'].includes(p.status)) return false;
    const delDate = new Date(p.deliveryDate);
    return delDate.toDateString() === now.toDateString();
  }).length;

  const kpis = {
    totalPurchasesMonth,
    pendingOrders,
    outstandingPayables,
    deliveriesExpectedToday,
    supplierCount: suppliers.length
  };
  
  // Reorder suggestions
  const reorderSuggestions = materials.filter(m => m.currentStock <= m.minStockLevel).map(m => ({
    materialId: m._id,
    name: m.name,
    currentStock: m.currentStock,
    minStockLevel: m.minStockLevel,
    suggestedQty: m.minStockLevel * 2 // Arbitrary logic for demo
  }));

  return successResponse(res, { kpis, reorderSuggestions }, 'Analytics fetched');
});

export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let poNumber = req.body.poNumber;
    if (!poNumber) {
      const count = await Purchase.countDocuments({ organizationId });
      poNumber = `PO-${1000 + count + 1}`;
    }

    const payload = {
      ...req.body,
      poNumber,
      organizationId,
      status: req.body.status || 'DRAFT'
    };

    const purchase = await Purchase.create([payload], { session });

    // Handle ledger if it comes in as RECEIVED instantly
    if (purchase[0].status === 'RECEIVED') {
      await processGRN(purchase[0], session);
    }

    await session.commitTransaction();
    session.endSession();
    return successResponse(res, purchase[0], 'Purchase created successfully', 201);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const updatePurchaseStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { status, items, invoiceNumber, amountPaid, paymentStatus } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findOne({ _id: id, organizationId }).session(session);
    if (!purchase) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Purchase not found', 404);
    }

    const oldStatus = purchase.status;

    // If updating GRN specifics
    if (items) {
      purchase.items = items;
    }
    
    if (invoiceNumber) purchase.invoiceNumber = invoiceNumber;
    if (paymentStatus) purchase.paymentStatus = paymentStatus;
    if (amountPaid !== undefined) {
       const supplier = await Supplier.findById(purchase.supplierId).session(session);
       if (supplier) {
         // Re-adjust supplier outstanding
         const diff = amountPaid - purchase.amountPaid;
         supplier.outstandingBalance -= diff;
         await supplier.save({ session });
       }
       purchase.amountPaid = amountPaid;
    }
    
    if (status) purchase.status = status;

    if (oldStatus !== 'RECEIVED' && purchase.status === 'RECEIVED') {
      await processGRN(purchase, session);
    } else if (oldStatus === 'RECEIVED' && purchase.status === 'CANCELLED') {
      await revertGRN(purchase, session);
    }

    await purchase.save({ session });
    await session.commitTransaction();
    session.endSession();
    return successResponse(res, purchase, 'Purchase updated successfully');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

async function processGRN(purchase: any, session: any) {
  for (const item of purchase.items) {
    // If no GRN details supplied, default to orderedQty
    const acceptedQty = item.acceptedQty || item.orderedQty || item.quantity || 0;
    
    if (acceptedQty > 0) {
      const material = await RawMaterial.findOne({ _id: item.rawMaterialId, organizationId: purchase.organizationId }).session(session);
      if (material) {
        const totalValue = (material.currentStock * material.unitCost) + (acceptedQty * item.unitCost);
        const newStock = material.currentStock + acceptedQty;
        material.unitCost = newStock > 0 ? totalValue / newStock : material.unitCost;
        material.currentStock = newStock;
        await material.save({ session });
      }
    }
  }
  
  // Update supplier outstanding balance
  if (purchase.paymentStatus !== 'PAID') {
     const supplier = await Supplier.findById(purchase.supplierId).session(session);
     if (supplier) {
       const unpaid = (purchase.grandTotal || purchase.totalAmount) - (purchase.amountPaid || 0);
       supplier.outstandingBalance += unpaid;
       await supplier.save({ session });
     }
  }
}

async function revertGRN(purchase: any, session: any) {
  for (const item of purchase.items) {
    const acceptedQty = item.acceptedQty || item.orderedQty || item.quantity || 0;
    
    if (acceptedQty > 0) {
      const material = await RawMaterial.findOne({ _id: item.rawMaterialId, organizationId: purchase.organizationId }).session(session);
      if (material) {
        const currentStock = material.currentStock;
        const currentAvgCost = material.unitCost;
        const newStock = currentStock - acceptedQty;
        
        if (newStock > 0) {
          material.unitCost = (currentStock * currentAvgCost - acceptedQty * item.unitCost) / newStock;
        } else {
          material.unitCost = 0;
        }
        material.currentStock = newStock;
        await material.save({ session });
      }
    }
  }
  
  // Revert supplier outstanding balance
  if (purchase.paymentStatus !== 'PAID') {
     const supplier = await Supplier.findById(purchase.supplierId).session(session);
     if (supplier) {
       const unpaid = (purchase.grandTotal || purchase.totalAmount) - (purchase.amountPaid || 0);
       supplier.outstandingBalance -= unpaid;
       await supplier.save({ session });
     }
  }
}
