const fs = require('fs');
let pos = fs.readFileSync('client/src/pages/pos/POSPage.tsx', 'utf8');

pos = pos.replace(
  "import { useOfflineSync } from '../../hooks/useOfflineSync';",
  "import { useOfflineSync } from '../../hooks/useOfflineSync';\nimport { db } from '../../utils/db';"
);

const handleHoldNew = `  const handleHoldBill = async () => {
    if (cart.length === 0) return;
    await db.holdBills.add({ cart, orderType, customer, createdAt: new Date() });
    toast.success('Bill placed on hold!');
    setCart([]);
    setCustomer(null);
  };
  
  const handleRecallBill = async () => {
    const held = await db.holdBills.orderBy('createdAt').reverse().first();
    if (held) {
      setCart(held.cart);
      setOrderType(held.orderType);
      setCustomer(held.customer);
      await db.holdBills.delete(held.id);
      toast.success('Bill recalled!');
    } else {
      toast.error('No bills on hold.');
    }
  };`;

pos = pos.replace(
  "  const handleAddToCart = (item: MenuItem) => {",
  handleHoldNew + "\n\n  const handleAddToCart = (item: MenuItem) => {"
);

pos = pos.replace(
  "if (e.key === 'F8') { e.preventDefault(); toast('Hold Bill (Coming Soon)'); }",
  "if (e.key === 'F8') { e.preventDefault(); handleHoldBill(); }\n      if (e.key === 'F9') { e.preventDefault(); handleRecallBill(); }"
);

pos = pos.replace(
  "else if (action.startsWith('type_')) setOrderType(action.split('_')[1] as OrderType);",
  "else if (action.startsWith('type_')) setOrderType(action.split('_')[1] as OrderType);\n    else if (action === 'hold') handleHoldBill();\n    else if (action === 'recall') handleRecallBill();\n    else if (action === 'customer') setShowCustomer(true);\n    else if (action === 'payment') { if(cart.length>0) setShowCheckout(true); }"
);

fs.writeFileSync('client/src/pages/pos/POSPage.tsx', pos);
