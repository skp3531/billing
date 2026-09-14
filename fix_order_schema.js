const fs = require('fs');

let model = fs.readFileSync('server/src/models/Order.ts', 'utf8');

// Remove from orderItemSchema
model = model.replace(
  "    priority: { type: String, enum: ['NORMAL', 'HIGH', 'VIP'], default: 'NORMAL' },\n    timeline: [{ status: String, timestamp: { type: Date, default: Date.now }, by: String, note: String }],",
  ""
);

// Add to orderSchema
model = model.replace(
  "notes: { type: String },",
  "notes: { type: String },\n    priority: { type: String, enum: ['NORMAL', 'HIGH', 'VIP'], default: 'NORMAL' },\n    timeline: [{ status: String, timestamp: { type: Date, default: Date.now }, by: String, note: String }],"
);

fs.writeFileSync('server/src/models/Order.ts', model);
