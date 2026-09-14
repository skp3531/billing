const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

if (!content.includes('import { assertOutletAccess }')) {
  content = content.replace(
    "import { successResponse, errorResponse } from '../utils/apiResponse';",
    "import { successResponse, errorResponse } from '../utils/apiResponse';\nimport { assertOutletAccess } from '../middleware/requireOutletAccess';"
  );
}

content = content.replace(
  "const order = await Order.findOne({ _id: id, organizationId });\n  if (!order) return errorResponse(res, 'Order not found', 404);",
  "const order = await Order.findOne({ _id: id, organizationId });\n  if (!order) return errorResponse(res, 'Order not found', 404);\n  if (!assertOutletAccess(order.outletId.toString(), req.user)) return errorResponse(res, 'Forbidden: You do not have access to this outlet', 403);"
);

content = content.replace(
  "const order = await Order.findOne({ _id: id, organizationId }).session(session);\n    if (!order) {\n      await session.abortTransaction();\n      return errorResponse(res, 'Order not found', 404);\n    }",
  "const order = await Order.findOne({ _id: id, organizationId }).session(session);\n    if (!order) {\n      await session.abortTransaction();\n      return errorResponse(res, 'Order not found', 404);\n    }\n    if (!assertOutletAccess(order.outletId.toString(), req.user)) {\n      await session.abortTransaction();\n      return errorResponse(res, 'Forbidden: You do not have access to this outlet', 403);\n    }"
);

fs.writeFileSync('server/src/controllers/order.controller.ts', content);
