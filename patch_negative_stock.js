const fs = require('fs');
let orgContent = fs.readFileSync('server/src/models/Organization.ts', 'utf8');

orgContent = orgContent.replace(
  "currency: { type: String, default: 'INR' },",
  "currency: { type: String, default: 'INR' },\n  allowNegativeStock: { type: Boolean, default: false },"
);
orgContent = orgContent.replace(
  "currency?: string;",
  "currency?: string;\n  allowNegativeStock?: boolean;"
);
fs.writeFileSync('server/src/models/Organization.ts', orgContent);

let typesContent = fs.readFileSync('client/src/types/index.ts', 'utf8');
typesContent = typesContent.replace(
  "currency?: string;",
  "currency?: string;\n  allowNegativeStock?: boolean;"
);
fs.writeFileSync('client/src/types/index.ts', typesContent);

let settingsContent = fs.readFileSync('client/src/pages/settings/SettingsPage.tsx', 'utf8');
// Find the Modules tab and add the negative stock toggle
settingsContent = settingsContent.replace(
  "updateModules({ kitchen: e.target.checked })}",
  "updateModules({ kitchen: e.target.checked })}\n                        className=\"h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded\"\n                      />\n                    </div>\n                    <div className=\"flex items-center justify-between\">\n                      <div>\n                        <h4 className=\"text-sm font-medium text-gray-900\">Allow Negative Stock</h4>\n                        <p className=\"text-sm text-gray-500\">Process orders even if inventory is insufficient</p>\n                      </div>\n                      <input\n                        type=\"checkbox\"\n                        checked={organization.allowNegativeStock || false}\n                        onChange={async (e) => {\n                          try {\n                            await api.put('/organization', { allowNegativeStock: e.target.checked });\n                            useAuthStore.setState({ organization: { ...organization, allowNegativeStock: e.target.checked } });\n                            toast.success('Settings updated');\n                          } catch (err) {\n                            toast.error('Failed to update settings');\n                          }\n                        }}"
);
fs.writeFileSync('client/src/pages/settings/SettingsPage.tsx', settingsContent);
