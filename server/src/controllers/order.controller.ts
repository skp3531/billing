import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Counter from '../models/Counter';
import MenuItem from '../models/MenuItem';
import RawMaterial from '../models/RawMaterial';
import Table from '../models/Table';
import Customer from '../models/Customer';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { assertOutletAccess } from '../middleware/requireOutletAccess';
import { deductInventoryForOrder, restoreInventoryForOrder } from '../utils/inventory';
import { createAuditLog } from '../utils/auditLog';

export const createOrder = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const {
    outletId,
    customerId,
    customer,
    type,
    orderType,
    tableNumber,
    paymentMethod,
    items,
    taxTotal = 0,
    discountTotal = 0,
    notes,
    status = 'PENDING',
  } = req.body;

  if (!outletId) {
    return errorResponse(res, 'Outlet ID is required', 400);
  }

  if (!items || !items.length) {
    return errorResponse(res, 'Order must contain at least one item', 400);
  }

  // Handle case mismatches from frontend
  const finalOrderType = (type || orderType || 'DINE_IN').toUpperCase();
  const finalPaymentMethod = (paymentMethod || 'CASH').toUpperCase();

  let subtotal = 0;
  let calculatedTaxTotal = 0;
  const calculatedItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findOne({ _id: item.menuItemId, organizationId });
    if (!menuItem) {
      return errorResponse(res, `Menu item not found: ${item.menuItemId}`, 404);
    }

    let unitPrice = menuItem.basePrice;
    let selectedVariant;
    if (item.variant) {
      const variantName = typeof item.variant === 'string' ? item.variant : item.variant.name;
      const dbVariant = menuItem.variants?.find((v: any) => v.name === variantName);
      if (dbVariant) {
        // Variant price is the absolute price, not an addition
        unitPrice = dbVariant.price;
        selectedVariant = { name: dbVariant.name, price: dbVariant.price };
      } else {
        return errorResponse(res, `Invalid variant selected: ${variantName} for menu item ${menuItem.name}`, 400);
      }
    }

    const selectedModifiers = [];
    const groupedSelections = new Map<string, number>();

    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        const modName = typeof mod === 'string' ? mod : mod.name;
        let found = false;
        
        for (const group of menuItem.modifierGroups) {
          const dbOpt = group.options.find((o: any) => o.name === modName);
          if (dbOpt) {
            if (!dbOpt.active) {
              return errorResponse(res, `Modifier option ${modName} is not active`, 400);
            }
            unitPrice += dbOpt.price;
            selectedModifiers.push({ name: modName, price: dbOpt.price });
            groupedSelections.set(group.name, (groupedSelections.get(group.name) || 0) + 1);
            found = true;
            break;
          }
        }
        
        if (!found) {
          return errorResponse(res, `Invalid modifier selected: ${modName} for menu item ${menuItem.name}`, 400);
        }
      }
    }

    // Validate modifier groups constraints
    if (menuItem.modifierGroups && menuItem.modifierGroups.length > 0) {
      for (const group of menuItem.modifierGroups) {
        const selectionCount = groupedSelections.get(group.name) || 0;
        if (group.isRequired && selectionCount === 0) {
          return errorResponse(res, `Modifier group ${group.name} is required for ${menuItem.name}`, 400);
        }
        if (selectionCount < group.minSelections) {
          return errorResponse(res, `Minimum ${group.minSelections} selections required for ${group.name}`, 400);
        }
        if (selectionCount > group.maxSelections) {
          return errorResponse(res, `Maximum ${group.maxSelections} selections allowed for ${group.name}`, 400);
        }
      }
    }

    const taxRate = menuItem.taxRate ?? 0;
    const taxType = menuItem.taxType || 'EXCLUSIVE';

    let basePriceExTax = unitPrice;
    let taxAmount = 0;

    if (taxType === 'INCLUSIVE') {
      basePriceExTax = unitPrice / (1 + taxRate / 100);
      taxAmount = unitPrice - basePriceExTax;
    } else {
      taxAmount = unitPrice * (taxRate / 100);
    }

    const itemSubtotal = basePriceExTax * item.quantity;
    const itemTaxTotal = taxAmount * item.quantity;
    const itemTotal = itemSubtotal + itemTaxTotal;

    subtotal += itemSubtotal;
    calculatedTaxTotal += itemTaxTotal;

    let stationName = 'general';
    if (menuItem.categoryId) {
      const category = await Category.findOne({ _id: menuItem.categoryId, organizationId });
      if (category) {
        stationName = category.name;
      }
    }

    calculatedItems.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      price: unitPrice,
      variant: selectedVariant,
      modifiers: selectedModifiers,
      itemTotal,
      subtotal: itemSubtotal,
      notes: item.notes,
      station: stationName,
    });
  }

  // Calculate grand total purely from server calculations
  let finalDiscount = 0;
  if (discountTotal > 0) {
    // Check permission - using a general POS/Orders permission for now if discount.apply doesn't exist
    if (!req.user!.permissions.includes('pos.manage')) {
      return errorResponse(res, 'You do not have permission to apply discounts', 403);
    }
    
    // Validate discount is not negative or exceeding subtotal
    finalDiscount = Math.min(Number(discountTotal), subtotal);
    if (finalDiscount < 0) finalDiscount = 0;
  }
  
  const grandTotal = subtotal + calculatedTaxTotal - finalDiscount;
  
    const counterId = `order_${organizationId}_${outletId}`;
    let counter = await Counter.findById(counterId);
    if (!counter) {
      const existingCount = await Order.countDocuments({ organizationId, outletId });
      try {
        await Counter.create({ _id: counterId, seq: existingCount });
      } catch (err: any) {
        if (err.code !== 11000) throw err;
      }
    }
    counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderNumber = `ORD-${1000 + counter!.seq}`;


  const session = await mongoose.startSession();
  session.startTransaction();
  
  let order;
  try {
    const orderDocs = await Order.create([{
      organizationId,
      outletId,
      orderNumber,
      tableNumber,
      customer,
      cashierId: req.user!.userId,
      cashierName: req.user!.userName || 'Unknown Cashier',
      orderType: finalOrderType,
      status: (status.toUpperCase() === 'PLACED' || status.toUpperCase() === 'ACCEPTED') ? 'PENDING' : status.toUpperCase(),
      paymentMethod: finalPaymentMethod,
      paymentStatus: ['CASH', 'CARD', 'UPI'].includes(finalPaymentMethod) ? 'PAID' : 'UNPAID',
      items: calculatedItems,
      subtotal,
      taxTotal: calculatedTaxTotal,
      discountTotal: finalDiscount,
      grandTotal,
      notes,
    }], { session });
    
    order = orderDocs[0];

    if (order.status === 'COMPLETED') {
      await deductInventoryForOrder(order, session);
    }

    if (finalOrderType === 'DINE_IN' && tableNumber) {
      await Table.findOneAndUpdate(
        { name: tableNumber, organizationId, outletId },
        { status: 'OCCUPIED' },
        { session }
      );
    }

    if (order.status === 'COMPLETED') {
      await updateCustomerCRMForOrder(order, true);
    }
      );
    }

    // Audit Logging
    await createAuditLog({
      organizationId,
      outletId,
      userId: req.user!.userId,
      userName: req.user!.userId,
      action: 'order.created',
      entity: 'Order',
      entityId: order._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      changes: { orderNumber: order.orderNumber, grandTotal: order.grandTotal, status: order.status }
    }, session);

    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Transaction aborted:', error);
    return errorResponse(res, error.message || 'Failed to complete order transaction', 500);
  } finally {
    session.endSession();
  }

  return successResponse(res, order, 'Order created successfully', 201);
};

export const getOrders = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { outletId, status, filter, page = '1', limit = '50', startDate, endDate } = req.query;

  const query: any = { organizationId };
  if (outletId) query.outletId = outletId;
  
  if (filter === 'active') {
    query.status = { $nin: ['COMPLETED', 'CANCELLED'] };
  } else if (filter === 'past') {
    query.status = { $in: ['COMPLETED', 'CANCELLED'] };
  } else if (status) {
    query.status = (status as string).toUpperCase();
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return res.status(200).json({
    success: true,
    message: 'Orders fetched successfully',
    data: orders,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    }
  });
};

export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const order = await Order.findOne({ _id: id, organizationId });
  if (!order) return errorResponse(res, 'Order not found', 404);
  if (!assertOutletAccess(order.outletId.toString(), req.user)) return errorResponse(res, 'Forbidden: You do not have access to this outlet', 403);
  return successResponse(res, order, 'Order fetched successfully');
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { status, paymentStatus } = req.body;

  const order = await Order.findOne({ _id: id, organizationId });
  if (!order) return errorResponse(res, 'Order not found', 404);

  const oldStatus = order.status;
  
  if (status) order.status = status.toUpperCase();
  if (paymentStatus) order.paymentStatus = paymentStatus.toUpperCase();

  const savedOrder = await order.save();

  // Inventory Deduction Logic
  if (status && status.toUpperCase() === 'COMPLETED' && oldStatus !== 'COMPLETED') {
    await deductInventoryForOrder(savedOrder);
    await updateCustomerCRMForOrder(savedOrder, true);
  } else if (status && status.toUpperCase() === 'CANCELLED' && oldStatus === 'COMPLETED') {
    await restoreInventoryForOrder(savedOrder);
    await updateCustomerCRMForOrder(savedOrder, false);
  }

  if (status && (status.toUpperCase() === 'COMPLETED' || status.toUpperCase() === 'CANCELLED') && oldStatus !== status.toUpperCase()) {
    if (savedOrder.tableNumber && savedOrder.orderType === 'DINE_IN') {
      await Table.findOneAndUpdate(
        { name: savedOrder.tableNumber, organizationId, outletId: savedOrder.outletId },
        { status: 'AVAILABLE' }
      );
    }
  }

  return successResponse(res, savedOrder, 'Order status updated successfully');
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  
  const order = await Order.findOne({ _id: id, organizationId });
  if (!order) return errorResponse(res, 'Order not found', 404);

  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    return errorResponse(res, 'Cannot delete a completed or already cancelled order. Please cancel or refund it instead.', 400);
  }

  // Soft delete / cancel for tracking instead of physical deletion
  order.status = 'CANCELLED';
  await order.save();
  
  return successResponse(res, null, 'Order cancelled successfully');
};

export const updateOrderItemStatus = async (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  const organizationId = req.user!.organizationId;
  const { status } = req.body;

  const order = await Order.findOne({ _id: id, organizationId });
  if (!order) return errorResponse(res, 'Order not found', 404);

  const item = order.items.find(i => (i as any)._id.toString() === itemId);
  if (!item) return errorResponse(res, 'Item not found in order', 404);

  item.status = status;
  await order.save();

  // If all items are PREPARED, maybe update the whole order?
  const allPrepared = order.items.every(i => i.status === 'PREPARED');
  if (allPrepared && order.status === 'PREPARING') {
    // Optionally update order status
  }

  return successResponse(res, order, 'Item status updated successfully');
};
