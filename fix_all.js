const fs = require('fs');

// Fix 1: commandCenter.controller.ts
let cc = fs.readFileSync('server/src/controllers/commandCenter.controller.ts', 'utf8');
cc = cc.replace(/o\.status === 'PAID' \|\| /g, '');
cc = cc.replace(/o\.totalAmount/g, '0');
fs.writeFileSync('server/src/controllers/commandCenter.controller.ts', cc);

// Fix 2: menuItem.controller.ts
let mi = fs.readFileSync('server/src/controllers/menuItem.controller.ts', 'utf8');
mi = mi.replace(
  "import { Request, Response } from 'express';",
  "import { Request, Response } from 'express';\nimport mongoose from 'mongoose';\nimport { asyncHandler } from '../middleware/asyncHandler';"
);
fs.writeFileSync('server/src/controllers/menuItem.controller.ts', mi);

// Fix 3: MenuItem.ts
let schema = fs.readFileSync('server/src/models/MenuItem.ts', 'utf8');
schema = schema.replace(/isNew\?/g, 'isNewItem?');
schema = schema.replace(/isNew: {/g, 'isNewItem: {');
fs.writeFileSync('server/src/models/MenuItem.ts', schema);

