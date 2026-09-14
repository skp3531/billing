import { Request, Response } from 'express';
import Order from '../models/Order';
import Counter from '../models/Counter';
import MenuItem from '../models/MenuItem';
import RawMaterial from '../models/RawMaterial';
import Table from '../models/Table';
import Customer from '../models/Customer';
import Category from '../models/Category';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { deductInventoryForOrder, restoreInventoryForOrder } from '../utils/inventory';

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
      const dbVariant = menuItem.variants.find((v: any) => v.name === variantName);
      if (dbVariant) {
        unitPrice += dbVariant.price;
        selectedVariant = { name: dbVariant.name, price: dbVariant.price };
      }
    }

    const selectedModifiers = [];
    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        const modName = typeof mod === 'string' ? mod : mod.name;
        let dbModPrice = 0;
        let found = false;
        for (const group of menuItem.modifierGroups) {
          const dbOpt = group.options.find((o: any) => o.name === modName);
          if (dbOpt) {
            dbModPrice = dbOpt.price;
            found = true;
            break;
          }
        }
        if (found) {
          unitPrice += dbModPrice;
          selectedModifiers.push({ name: modName, price: dbModPrice });
        }
      }
    }

    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

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
      price: menuItem.basePrice,
      variant: selectedVariant,
      modifiers: selectedModifiers,
      itemTotal,
      notes: item.notes,
      station: stationName,
    });
  }

  const grandTotal = subtotal + taxTotal - discountTotal;
  
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


  const order = await Order.create({
    organizationId,
    outletId,
    orderNumber,
    tableNumber,
    customer,
    cashierId: req.user!.userId,
    cashierName: req.user!.userId, // Name not available in token directly
    orderType: finalOrderType,
    status: (status.toUpperCase() === 'PLACED' || status.toUpperCase() === 'ACCEPTED') ? 'PENDING' : status.toUpperCase(),
    paymentMethod: finalPaymentMethod,
    paymentStatus: finalPaymentMethod === 'PENDING' ? 'UNPAID' : (finalPaymentMethod === 'CASH' ? 'PAID' : 'UNPAID'),
    items: calculatedItems,
    subtotal,
    taxTotal,
    discountTotal,
    grandTotal,
    notes,
  });

  if (order.status === 'COMPLETED') {
    await deductInventoryForOrder(order);
  }

  if (finalOrderType === 'DINE_IN' && tableNumber) {
    await Table.findOneAndUpdate(
      { name: tableNumber, organizationId, outletId },
      { status: 'OCCUPIED' }
    );
  }

  
  if (order.status === 'COMPLETED' && req.body.customerId) {
    await Customer.findOneAndUpdate(
      { _id: req.body.customerId, organizationId },
      { $inc: { totalSpent: order.grandTotal, loyaltyPoints: Math.floor(order.grandTotal / 100) } }
    );
  }

  return successResponse(res, order, 'Order created successfully', 201);
};

export const getOrders = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { outletId, status, filter, page = '1', limit = '50' } = req.query;

  const query: any = { organizationId };
  if (outletId) query.outletId = outletId;
  
  if (filter === 'active') {
    query.status = { $nin: ['COMPLETED', 'CANCELLED'] };
  } else if (filter === 'past') {
    query.status = { $in: ['COMPLETED', 'CANCELLED'] };
  } else if (status) {
    query.status = (status as string).toUpperCase();
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
  } else if (status && status.toUpperCase() === 'CANCELLED' && oldStatus === 'COMPLETED') {
    await restoreInventoryForOrder(savedOrder);
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
  const order = await Order.findOneAndDelete({ _id: id, organizationId });
  if (!order) return errorResponse(res, 'Order not found', 404);
  return successResponse(res, null, 'Order deleted successfully');
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
