const fs = require('fs');
let types = fs.readFileSync('client/src/types/index.ts', 'utf8');
types = types.replace(
  "export type PaymentMethod = 'cash' | 'card' | 'upi';",
  "export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'PENDING' | 'SPLIT';"
);
fs.writeFileSync('client/src/types/index.ts', types);

// Fix POSPage handleCheckoutConfirm mismatch
let pos = fs.readFileSync('client/src/pages/pos/POSPage.tsx', 'utf8');
pos = pos.replace(
  "const handleCheckoutConfirm = async (method: PaymentMethod, splits?: any[]) => {",
  "const handleCheckoutConfirm = async (method: PaymentMethod, splits?: any[]) => {"
);
fs.writeFileSync('client/src/pages/pos/POSPage.tsx', pos);

