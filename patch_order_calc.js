const fs = require('fs');

let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

const oldBlock = `    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    let stationName = 'general';
    if (menuItem.categoryId) {
      const category = await Category.findOne({ _id: menuItem.categoryId, organizationId });
      if (category) {
        stationName = category.name;
      }
    }

    calculatedItems.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.basePrice,
      variant: selectedVariant,
      modifiers: selectedModifiers,
      itemTotal,
      notes: item.notes,
      station: stationName,
    });`;

const newBlock = `    const taxRate = menuItem.taxRate || 5;
    const taxType = menuItem.taxType || 'EXCLUSIVE';

    let basePriceExTax = unitPrice;
    let taxAmount = 0;

    if (taxType === 'INCLUSIVE') {
      basePriceExTax = unitPrice / (1 + taxRate / 100);
      taxAmount = unitPrice - basePriceExTax;
    } else {
      taxAmount = unitPrice * (taxRate / 100);
    }

    const itemSubtotal = basePriceExTax * item.quantity;
    const itemTaxTotal = taxAmount * item.quantity;
    const itemTotal = itemSubtotal + itemTaxTotal;

    subtotal += itemSubtotal;
    calculatedTaxTotal += itemTaxTotal;

    let stationName = 'general';
    if (menuItem.categoryId) {
      const category = await Category.findOne({ _id: menuItem.categoryId, organizationId });
      if (category) {
        stationName = category.name;
      }
    }

    calculatedItems.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      price: unitPrice,
      variant: selectedVariant,
      modifiers: selectedModifiers,
      itemTotal,
      subtotal: itemSubtotal,
      notes: item.notes,
      station: stationName,
    });`;

content = content.replace(oldBlock, newBlock);

content = content.replace(
  "let subtotal = 0;\n  const calculatedItems = [];",
  "let subtotal = 0;\n  let calculatedTaxTotal = 0;\n  const calculatedItems = [];"
);

content = content.replace(
  "const grandTotal = subtotal + taxTotal - discountTotal;",
  "// Calculate grand total purely from server calculations\n  let finalDiscount = 0;\n  // TODO: validate discount if provided\n  \n  const grandTotal = subtotal + calculatedTaxTotal - finalDiscount;"
);

// We need to fix the object sent to Order.create
content = content.replace(
  "taxTotal,\n    discountTotal,\n    grandTotal,",
  "taxTotal: calculatedTaxTotal,\n    discountTotal: finalDiscount,\n    grandTotal,"
);

fs.writeFileSync('server/src/controllers/order.controller.ts', content);
