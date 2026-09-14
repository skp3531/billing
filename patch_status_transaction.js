const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

const oldUpdate = `export const updateOrderStatus = async (req: Request, res: Response) => {
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

  // Handle table status
  if (savedOrder.orderType === 'DINE_IN' && savedOrder.tableNumber && status) {
    if (status.toUpperCase() === 'COMPLETED' || status.toUpperCase() === 'CANCELLED') {
      await Table.findOneAndUpdate(
        { name: savedOrder.tableNumber, organizationId, outletId: savedOrder.outletId },
        { status: 'AVAILABLE' }
      );
    }
  }

  return successResponse(res, savedOrder, 'Order status updated');
};`;

const newUpdate = `export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { status, paymentStatus } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  let savedOrder;
  try {
    const order = await Order.findOne({ _id: id, organizationId }).session(session);
    if (!order) {
      await session.abortTransaction();
      return errorResponse(res, 'Order not found', 404);
    }

    const oldStatus = order.status;
    
    if (status) order.status = status.toUpperCase();
    if (paymentStatus) order.paymentStatus = paymentStatus.toUpperCase();

    savedOrder = await order.save({ session });

    // Inventory Deduction Logic
    if (status && status.toUpperCase() === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      await deductInventoryForOrder(savedOrder, session);
    } else if (status && status.toUpperCase() === 'CANCELLED' && oldStatus === 'COMPLETED') {
      await restoreInventoryForOrder(savedOrder, session);
    }

    // Handle table status
    if (savedOrder.orderType === 'DINE_IN' && savedOrder.tableNumber && status) {
      if (status.toUpperCase() === 'COMPLETED' || status.toUpperCase() === 'CANCELLED') {
        await Table.findOneAndUpdate(
          { name: savedOrder.tableNumber, organizationId, outletId: savedOrder.outletId },
          { status: 'AVAILABLE' },
          { session }
        );
      }
    }

    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Update Order Status Transaction aborted:', error);
    return errorResponse(res, error.message || 'Failed to update order status', 500);
  } finally {
    session.endSession();
  }

  return successResponse(res, savedOrder, 'Order status updated');
};`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('server/src/controllers/order.controller.ts', content);
