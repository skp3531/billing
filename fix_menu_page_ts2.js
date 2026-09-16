const fs = require('fs');
let content = fs.readFileSync('client/src/pages/menu/MenuPage.tsx', 'utf8');

content = content.replace(
  "item={editingItem}",
  "item={editingItem}\n          saving={false}"
);

fs.writeFileSync('client/src/pages/menu/MenuPage.tsx', content);
