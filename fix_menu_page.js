const fs = require('fs');
let content = fs.readFileSync('client/src/pages/menu/MenuPage.tsx', 'utf8');

// The file currently has subtitle={\`\${engineeringData?.kpis?.activeItems} Active`}
// Let's replace `\`` with '`' and `\${` with '${'

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('client/src/pages/menu/MenuPage.tsx', content);
