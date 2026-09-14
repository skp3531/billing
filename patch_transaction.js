const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

// Need to import mongoose
if (!content.includes('import mongoose')) {
  content = content.replace("import { Request, Response } from 'express';", "import { Request, Response } from 'express';\nimport mongoose from 'mongoose';");
}

// Replace the execution part with a transaction
const oldExecution = `  const order = await Order.create({
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
    paymentStatus: ['CASH', 'CARD', 'UPI'].includes(finalPaymentMethod) ? 'PAID' : 'UNPAID',
    items: calculatedItems,
    subtotal,
    taxTotal: calculatedTaxTotal,
    discountTotal: finalDiscount,
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

  return successResponse(res, order, 'Order created successfully', 201);`;

const newExecution = `  const session = await mongoose.startSession();
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
      cashierName: req.user!.userId,
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

    if (order.status === 'COMPLETED' && req.body.customerId) {
      await Customer.findOneAndUpdate(
        { _id: req.body.customerId, organizationId },
        { $inc: { totalSpent: order.grandTotal, loyaltyPoints: Math.floor(order.grandTotal / 100) } },
        { session }
      );
    }

    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Transaction aborted:', error);
    return errorResponse(res, error.message || 'Failed to complete order transaction', 500);
  } finally {
    session.endSession();
  }

  return successResponse(res, order, 'Order created successfully', 201);`;

content = content.replace(oldExecution, newExecution);
fs.writeFileSync('server/src/controllers/order.controller.ts', content);
