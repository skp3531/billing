import { Request, Response } from 'express';
import Purchase from '../models/Purchase';
import RawMaterial from '../models/RawMaterial';
import { successResponse, errorResponse } from '../utils/apiResponse';
import mongoose from 'mongoose';

export const getPurchases = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const purchases = await Purchase.find({ organizationId }).populate('supplierId').populate('items.rawMaterialId').sort({ date: -1 });
  return successResponse(res, purchases, 'Purchases fetched successfully');
};

export const createPurchase = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.create([{ ...req.body, organizationId }], { session });

    if (purchase[0].status === 'Completed') {
      for (const item of purchase[0].items) {
        const material = await RawMaterial.findOne({ _id: item.rawMaterialId, organizationId }).session(session);
        if (material) {
          const totalValue = (material.currentStock * material.unitCost) + (item.quantity * item.unitCost);
          const newStock = material.currentStock + item.quantity;
          material.unitCost = newStock > 0 ? totalValue / newStock : material.unitCost;
          material.currentStock = newStock;
          await material.save({ session });
        }
      }
    }

    await session.commitTransaction();
    session.endSession();
    return successResponse(res, purchase[0], 'Purchase created successfully', 201);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const updatePurchaseStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { status } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findOne({ _id: id, organizationId }).session(session);
    if (!purchase) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Purchase not found', 404);
    }

    if (purchase.status !== 'Completed' && status === 'Completed') {
      for (const item of purchase.items) {
        const material = await RawMaterial.findOne({ _id: item.rawMaterialId, organizationId }).session(session);
        if (material) {
          const totalValue = (material.currentStock * material.unitCost) + (item.quantity * item.unitCost);
          const newStock = material.currentStock + item.quantity;
          material.unitCost = newStock > 0 ? totalValue / newStock : material.unitCost;
          material.currentStock = newStock;
          await material.save({ session });
        }
      }
    } else if (purchase.status === 'Completed' && (status === 'Cancelled' || status === 'Pending')) {
      for (const item of purchase.items) {
        const material = await RawMaterial.findOne({ _id: item.rawMaterialId, organizationId }).session(session);
        if (material) {
          const currentStock = material.currentStock;
          const currentAvgCost = material.unitCost;
          const purchaseQty = item.quantity;
          const purchaseUnitCost = item.unitCost;
          
          const newStock = currentStock - purchaseQty;
          
          if (newStock > 0) {
            material.unitCost = (currentStock * currentAvgCost - purchaseQty * purchaseUnitCost) / newStock;
          } else {
            material.unitCost = 0;
          }
          
          material.currentStock = newStock;
          await material.save({ session });
        }
      }
    }

    if (status) purchase.status = status;
    await purchase.save({ session });

    await session.commitTransaction();
    session.endSession();
    return successResponse(res, purchase, 'Purchase updated successfully');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
