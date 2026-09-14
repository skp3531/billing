const fs = require('fs');
let model = fs.readFileSync('server/src/models/Order.ts', 'utf8');

// Strip the accidentally inserted priority/timeline from orderItemSchema
model = model.replace(
  "notes: { type: String },\n    priority: { type: String, enum: ['NORMAL', 'HIGH', 'VIP'], default: 'NORMAL' },\n    timeline: [{ status: String, timestamp: { type: Date, default: Date.now }, by: String, note: String }],",
  "notes: { type: String },"
);

// Inject into orderSchema right before cashierId
model = model.replace(
  "cashierId: { type: Schema.Types.ObjectId, ref: 'User' },",
  "priority: { type: String, enum: ['NORMAL', 'HIGH', 'VIP'], default: 'NORMAL' },\n    timeline: [{ status: String, timestamp: { type: Date, default: Date.now }, by: String, note: String }],\n    cashierId: { type: Schema.Types.ObjectId, ref: 'User' },"
);

fs.writeFileSync('server/src/models/Order.ts', model);
