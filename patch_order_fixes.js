const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

// 1. Fix taxRate || 5 to taxRate ?? 0
content = content.replace(
  "const taxRate = menuItem.taxRate || 5;",
  "const taxRate = menuItem.taxRate ?? 0;"
);

// 2. Reject invalid variants instead of falling back to base price
const oldVariantCheck = `    if (item.variant) {
      const variantName = typeof item.variant === 'string' ? item.variant : item.variant.name;
      const dbVariant = menuItem.variants.find((v: any) => v.name === variantName);
      if (dbVariant) {
        // Variant price is the absolute price, not an addition
        unitPrice = dbVariant.price;
        selectedVariant = { name: dbVariant.name, price: dbVariant.price };
      }
    }`;

const newVariantCheck = `    if (item.variant) {
      const variantName = typeof item.variant === 'string' ? item.variant : item.variant.name;
      const dbVariant = menuItem.variants?.find((v: any) => v.name === variantName);
      if (dbVariant) {
        // Variant price is the absolute price, not an addition
        unitPrice = dbVariant.price;
        selectedVariant = { name: dbVariant.name, price: dbVariant.price };
      } else {
        return errorResponse(res, \`Invalid variant selected: \${variantName} for menu item \${menuItem.name}\`, 400);
      }
    }`;
content = content.replace(oldVariantCheck, newVariantCheck);

// 3. Fix cashierName
content = content.replace(
  "cashierName: req.user!.userId,",
  "cashierName: req.user!.userName || 'Unknown Cashier',"
);

// We also need to fix userName in req.user payload
// Wait, I need to check if userName is in AccessTokenPayload

fs.writeFileSync('server/src/controllers/order.controller.ts', content);
