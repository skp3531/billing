const fs = require('fs');

let content = fs.readFileSync('client/src/App.tsx', 'utf8');

content = content.replace(
  '<Route path="menu" element={<MenuPage />} />',
  '<Route path="menu" element={<PermissionGuard permission="menu.view"><MenuPage /></PermissionGuard>} />'
);

content = content.replace(
  '<Route path="reports" element={<ReportsPage />} />',
  '<Route path="reports" element={<PermissionGuard permission="reports.view"><ReportsPage /></PermissionGuard>} />'
);

content = content.replace(
  '<Route path="settings" element={<SettingsPage />} />',
  '<Route path="settings" element={<PermissionGuard permission="settings.view"><SettingsPage /></PermissionGuard>} />'
);

content = content.replace(
  '<Route path="dashboard" element={<DashboardPage />} />',
  '<Route path="dashboard" element={<PermissionGuard permission="dashboard.view"><DashboardPage /></PermissionGuard>} />'
);

content = content.replace(
  '<Route path="pos" element={<POSPage />} />',
  '<Route path="pos" element={<PermissionGuard permission="pos.view"><POSPage /></PermissionGuard>} />'
);

content = content.replace(
  '<Route path="orders" element={<OrdersPage />} />',
  '<Route path="orders" element={<PermissionGuard permission="orders.view"><OrdersPage /></PermissionGuard>} />'
);

fs.writeFileSync('client/src/App.tsx', content);
