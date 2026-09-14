const fs = require('fs');

let content = fs.readFileSync('server/src/models/RawMaterial.ts', 'utf8');

content = content.replace(
  "organizationId: mongoose.Types.ObjectId;",
  "organizationId: mongoose.Types.ObjectId;\n  outletId: mongoose.Types.ObjectId;"
);

content = content.replace(
  "organizationId: {",
  "outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },\n    organizationId: {"
);

fs.writeFileSync('server/src/models/RawMaterial.ts', content);
