const fs = require('fs');
let pos = fs.readFileSync('client/src/pages/pos/POSPage.tsx', 'utf8');

pos = pos.replace(
  "price: c.unitPrice,",
  "unitPrice: c.unitPrice,"
);
fs.writeFileSync('client/src/pages/pos/POSPage.tsx', pos);
