const fs = require('fs');
let content = fs.readFileSync('client/src/pages/kitchen/KitchenPage.tsx', 'utf8');
content = content.replace(/\\`/g, "`");
content = content.replace(/\\\$/g, "$");
fs.writeFileSync('client/src/pages/kitchen/KitchenPage.tsx', content);
