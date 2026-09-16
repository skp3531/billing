const fs = require('fs');
let content = fs.readFileSync('client/src/pages/settings/SettingsPage.tsx', 'utf8');

content = content.replace(
  "to={app.path}",
  "to={app.path || '/'}"
);

fs.writeFileSync('client/src/pages/settings/SettingsPage.tsx', content);
