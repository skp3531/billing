const fs = require('fs');
let sidebar = fs.readFileSync('client/src/components/layout/Sidebar.tsx', 'utf8');

sidebar = sidebar.replace(
  "href: '/reservations'",
  "path: '/reservations'"
);

fs.writeFileSync('client/src/components/layout/Sidebar.tsx', sidebar);
