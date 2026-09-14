const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

if (!content.includes('import { createAuditLog }')) {
  content = content.replace("import { deductInventoryForOrder, restoreInventoryForOrder } from '../utils/inventory';", "import { deductInventoryForOrder, restoreInventoryForOrder } from '../utils/inventory';\nimport { createAuditLog } from '../utils/auditLog';");
}

const oldCreate = `    if (order.status === 'COMPLETED' && req.body.customerId) {
      await Customer.findOneAndUpdate(
        { _id: req.body.customerId, organizationId },
        { $inc: { totalSpent: order.grandTotal, loyaltyPoints: Math.floor(order.grandTotal / 100) } },
        { session }
      );
    }

    await session.commitTransaction();`;

const newCreate = `    if (order.status === 'COMPLETED' && req.body.customerId) {
      await Customer.findOneAndUpdate(
        { _id: req.body.customerId, organizationId },
        { $inc: { totalSpent: order.grandTotal, loyaltyPoints: Math.floor(order.grandTotal / 100) } },
        { session }
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
      entityId: order._id as string,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { orderNumber: order.orderNumber, grandTotal: order.grandTotal, status: order.status }
    }, session);

    await session.commitTransaction();`;

content = content.replace(oldCreate, newCreate);
fs.writeFileSync('server/src/controllers/order.controller.ts', content);
