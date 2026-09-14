const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\\`/g, "`");
  content = content.replace(/\\\$/g, "$");
  fs.writeFileSync(path, content);
};

fixFile('client/src/pages/reports/components/KPICard.tsx');
fixFile('client/src/pages/reports/ProductsView.tsx');
fixFile('client/src/pages/reports/SalesView.tsx');
