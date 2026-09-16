const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/commandCenter.controller.ts', 'utf8');

content = content.replace(/o\.totalAmount/g, 'o.grandTotal');
content = content.replace(/o\.discount \|\|/g, 'o.discountTotal ||');
content = content.replace(/o\.status === 'PAID' \|\| /g, '');
content = content.replace(/o\.status === 'READY'/g, 'false'); // order status doesn't have READY

fs.writeFileSync('server/src/controllers/commandCenter.controller.ts', content);
