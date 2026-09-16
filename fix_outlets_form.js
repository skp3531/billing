const fs = require('fs');

let content = fs.readFileSync('client/src/pages/outlets/OutletsPage.tsx', 'utf8');
content = content.replace(
  "phone: o.phone || '', gstin: o.gstin || '',",
  "phone: o.phone || '', gstin: o.gstin || '', taxRate: o.taxRate || 5,"
);
fs.writeFileSync('client/src/pages/outlets/OutletsPage.tsx', content);
