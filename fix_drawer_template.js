const fs = require('fs');
let content = fs.readFileSync('client/src/pages/orders/components/OrderDetailsDrawer.tsx', 'utf8');

// I can just replace `${modalType}` with it, wait, it IS `${modalType}` which is valid JSX!
// `title={\`${modalType} Order\`}` is what I meant, let's fix it manually.
content = content.replace(
  "title={`${modalType} Order`}",
  "title={modalType + ' Order'}"
);
fs.writeFileSync('client/src/pages/orders/components/OrderDetailsDrawer.tsx', content);
