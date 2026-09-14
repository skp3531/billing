const fs = require('fs');

let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

const oldBlock = `  let finalDiscount = 0;
  // TODO: validate discount if provided
  
  const grandTotal = subtotal + calculatedTaxTotal - finalDiscount;`;

const newBlock = `  let finalDiscount = 0;
  if (discountTotal > 0) {
    // Check permission - using a general POS/Orders permission for now if discount.apply doesn't exist
    if (!req.user!.permissions.includes('pos.manage')) {
      return errorResponse(res, 'You do not have permission to apply discounts', 403);
    }
    
    // Validate discount is not negative or exceeding subtotal
    finalDiscount = Math.min(Number(discountTotal), subtotal);
    if (finalDiscount < 0) finalDiscount = 0;
  }
  
  const grandTotal = subtotal + calculatedTaxTotal - finalDiscount;`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('server/src/controllers/order.controller.ts', content);
