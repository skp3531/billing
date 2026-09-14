const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

const oldDelete = `export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const order = await Order.findOneAndDelete({ _id: id, organizationId });
  if (!order) return errorResponse(res, 'Order not found', 404);
  return successResponse(res, null, 'Order deleted successfully');
};`;

const newDelete = `export const deleteOrder = async (req: Request, res: Response) => {
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
};`;

content = content.replace(oldDelete, newDelete);
fs.writeFileSync('server/src/controllers/order.controller.ts', content);
