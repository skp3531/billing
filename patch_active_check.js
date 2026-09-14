const fs = require('fs');

const files = ['server/src/controllers/category.controller.ts', 'server/src/controllers/menuItem.controller.ts'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Category\.find\(\{\s*organizationId\s*\}\)/g, "Category.find({ organizationId, active: true })");
  content = content.replace(/MenuItem\.find\(\{\s*organizationId\s*\}\)/g, "MenuItem.find({ organizationId, active: true })");
  
  // also handle where it might have outletId in find
  content = content.replace(/MenuItem\.find\(\{\s*organizationId,\s*outletId\s*\}\)/g, "MenuItem.find({ organizationId, outletId, active: true })");
  fs.writeFileSync(file, content);
}
