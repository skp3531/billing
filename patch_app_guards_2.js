const fs = require('fs');
let content = fs.readFileSync('client/src/App.tsx', 'utf8');

content = content.replace(
  '<Route path="settings/outlets" element={<OutletsPage />} />',
  '<Route path="settings/outlets" element={<PermissionGuard permission="settings.manage"><OutletsPage /></PermissionGuard>} />'
);

content = content.replace(
  '<Route path="settings/roles" element={<RolesPage />} />',
  '<Route path="settings/roles" element={<PermissionGuard permission="roles.manage"><RolesPage /></PermissionGuard>} />'
);

fs.writeFileSync('client/src/App.tsx', content);
