const fs = require('fs');
let model = fs.readFileSync('server/src/models/Order.ts', 'utf8');

// Update interface
model = model.replace(
  "paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'PENDING';",
  "paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'PENDING' | 'SPLIT';\n  splitPayments?: { method: 'CASH' | 'CARD' | 'UPI'; amount: number }[];"
);

// Update schema
model = model.replace(
  "paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI', 'PENDING'], default: 'PENDING' },",
  "paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI', 'PENDING', 'SPLIT'], default: 'PENDING' },\n    splitPayments: [{ method: { type: String, enum: ['CASH', 'CARD', 'UPI'] }, amount: Number }],"
);

fs.writeFileSync('server/src/models/Order.ts', model);

let types = fs.readFileSync('client/src/types/index.ts', 'utf8');
types = types.replace(
  "export type PaymentMethod = 'cash' | 'card' | 'upi' | 'pending';",
  "export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'PENDING' | 'SPLIT';"
);
types = types.replace(
  "paymentMethod: PaymentMethod;",
  "paymentMethod: PaymentMethod;\n  splitPayments?: { method: PaymentMethod; amount: number }[];"
);
fs.writeFileSync('client/src/types/index.ts', types);
