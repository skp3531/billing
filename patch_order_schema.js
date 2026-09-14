const fs = require('fs');

// Patch Backend Model
let model = fs.readFileSync('server/src/models/Order.ts', 'utf8');

model = model.replace(
  "export interface IOrder extends Document {",
  "export interface IOrder extends Document {\n  priority?: 'NORMAL' | 'HIGH' | 'VIP';\n  timeline?: { status: string; timestamp: Date; by?: string; note?: string }[];"
);

model = model.replace(
  "notes: { type: String },",
  "notes: { type: String },\n    priority: { type: String, enum: ['NORMAL', 'HIGH', 'VIP'], default: 'NORMAL' },\n    timeline: [{ status: String, timestamp: { type: Date, default: Date.now }, by: String, note: String }],"
);

fs.writeFileSync('server/src/models/Order.ts', model);

// Patch Frontend Types
let types = fs.readFileSync('client/src/types/index.ts', 'utf8');

types = types.replace(
  "export interface Order {",
  "export interface Order {\n  priority?: 'NORMAL' | 'HIGH' | 'VIP';\n  timeline?: { status: string; timestamp: Date; by?: string; note?: string }[];"
);

fs.writeFileSync('client/src/types/index.ts', types);
