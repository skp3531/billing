const fs = require('fs');

// 1. Sidebar.tsx
let sidebar = fs.readFileSync('client/src/components/layout/Sidebar.tsx', 'utf8');
if (!sidebar.includes("name: 'Reservations'")) {
  sidebar = sidebar.replace(
    "name: 'Tables',",
    "name: 'Reservations', href: '/reservations', icon: CalendarDays },\n  { name: 'Tables',"
  );
  if (!sidebar.includes("CalendarDays")) {
    sidebar = sidebar.replace(
      "import {",
      "import { CalendarDays,"
    );
  }
  fs.writeFileSync('client/src/components/layout/Sidebar.tsx', sidebar);
}

// 2. App.tsx routes
let app = fs.readFileSync('client/src/App.tsx', 'utf8');
if (!app.includes("ReservationsPage")) {
  app = app.replace(
    "import TablesPage from './pages/tables/TablesPage';",
    "import TablesPage from './pages/tables/TablesPage';\nimport ReservationsPage from './pages/reservations/ReservationsPage';"
  );
  app = app.replace(
    "<Route path=\"tables\" element={<TablesPage />} />",
    "<Route path=\"tables\" element={<TablesPage />} />\n            <Route path=\"reservations\" element={<ReservationsPage />} />"
  );
  fs.writeFileSync('client/src/App.tsx', app);
}
