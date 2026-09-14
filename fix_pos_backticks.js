const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\\`/g, "`");
  content = content.replace(/\\\$/g, "$");
  fs.writeFileSync(path, content);
};

fixFile('client/src/pages/pos/components/CartSidebar.tsx');
fixFile('client/src/pages/pos/components/POSSidebar.tsx');
fixFile('client/src/pages/pos/POSPage.tsx');
