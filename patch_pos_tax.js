const fs = require('fs');

let content = fs.readFileSync('client/src/pages/pos/POSPage.tsx', 'utf8');

// Replace naive subtotal and tax calculation
const oldCalc = `  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.05; // 5% tax hardcoded for now
  const grandTotal = subtotal + tax;`;

const newCalc = `  let subtotal = 0;
  let tax = 0;
  cart.forEach(item => {
    const taxRate = item.menuItem.taxRate || 5;
    const taxType = item.menuItem.taxType || 'EXCLUSIVE';
    
    let basePriceExTax = item.unitPrice;
    let taxAmount = 0;
    if (taxType === 'INCLUSIVE') {
      basePriceExTax = item.unitPrice / (1 + taxRate / 100);
      taxAmount = item.unitPrice - basePriceExTax;
    } else {
      taxAmount = item.unitPrice * (taxRate / 100);
    }
    
    subtotal += basePriceExTax * item.quantity;
    tax += taxAmount * item.quantity;
  });
  const grandTotal = subtotal + tax;`;

content = content.replace(oldCalc, newCalc);

fs.writeFileSync('client/src/pages/pos/POSPage.tsx', content);
