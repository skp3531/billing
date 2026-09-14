const fs = require('fs');
let content = fs.readFileSync('server/src/utils/inventory.ts', 'utf8');

if (!content.includes('import { Organization }')) {
  content = content.replace(
    "import RawMaterial from '../models/RawMaterial';",
    "import RawMaterial from '../models/RawMaterial';\nimport { Organization } from '../models/Organization';"
  );
}

content = content.replace(
  "const materials = await RawMaterial.find({",
  "const org = await Organization.findById(order.organizationId).session(session || null);\n    const allowNegativeStock = org?.allowNegativeStock ?? false;\n\n    const materials = await RawMaterial.find({"
);

content = content.replace(
  "if (mat.currentStock < needed) {\n        throw new Error(`Insufficient stock for raw material: ${mat.name}. Needed ${needed}, but only ${mat.currentStock} available.`);\n      }",
  "if (mat.currentStock < needed && !allowNegativeStock) {\n        throw new Error(`Insufficient stock for raw material: ${mat.name}. Needed ${needed}, but only ${mat.currentStock} available.`);\n      }"
);

fs.writeFileSync('server/src/utils/inventory.ts', content);
