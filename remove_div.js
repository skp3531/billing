const fs = require('fs');
let content = fs.readFileSync('client/src/pages/dashboard/DashboardPage.tsx', 'utf8');

// replace the last '</div>\n  );' with '  );'
content = content.replace(/<\/div>\s*\);\s*}\s*$/, '  );\n}\n');

fs.writeFileSync('client/src/pages/dashboard/DashboardPage.tsx', content);
