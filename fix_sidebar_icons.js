const fs = require('fs');
let sidebar = fs.readFileSync('client/src/components/layout/Sidebar.tsx', 'utf8');

sidebar = sidebar.replace(
  "icon: CalendarDays",
  "icon: CalendarIcon"
);

sidebar = sidebar.replace(
  "CogIcon, XMarkIcon",
  "CogIcon, XMarkIcon, CalendarIcon"
);

fs.writeFileSync('client/src/components/layout/Sidebar.tsx', sidebar);
