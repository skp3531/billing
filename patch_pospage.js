const fs = require('fs');

let content = fs.readFileSync('client/src/pages/pos/POSPage.tsx', 'utf8');

// Imports
content = content.replace(
  "import { CartSidebar } from './components/CartSidebar';",
  "import { CartSidebar } from './components/CartSidebar';\nimport { CheckoutModal } from './components/CheckoutModal';\nimport { CustomerModal } from './components/CustomerModal';"
);

// States
content = content.replace(
  "const [orderType, setOrderType] = useState<OrderType>('takeaway');",
  "const [orderType, setOrderType] = useState<OrderType>('takeaway');\n  const [showCheckout, setShowCheckout] = useState(false);\n  const [showCustomer, setShowCustomer] = useState(false);\n  const [customer, setCustomer] = useState<any>(null);"
);

// F10 Handle
content = content.replace(
  "if (e.key === 'F10') { e.preventDefault(); handleCheckout(); }",
  "if (e.key === 'F10') { e.preventDefault(); if(cart.length > 0) setShowCheckout(true); }\n      if (e.key === 'F4') { e.preventDefault(); setShowCustomer(true); }"
);

// handleCheckout function rewrite
const checkoutOld = "const handleCheckout = () => {\\s+if \\(cart.length === 0\\) return;\\s+toast.success\\('Checkout flow opening...'\\);\\s+// Real implementation will open payment modal\\s+};";
const checkoutNew = `const handleCheckoutConfirm = async (method: PaymentMethod, splits?: any[]) => {
    try {
      const orderPayload = {
        orderType,
        paymentMethod: method,
        splitPayments: splits,
        paymentStatus: method === 'PENDING' ? 'UNPAID' : 'PAID',
        customer: customer ? { name: customer.name, phone: customer.phone } : undefined,
        items: cart.map(c => ({
          menuItemId: c.menuItem._id,
          name: c.menuItem.name,
          quantity: c.quantity,
          price: c.unitPrice,
          itemTotal: c.subtotal,
          notes: c.notes,
          modifiers: c.modifiers
        })),
        subtotal,
        taxTotal,
        discountTotal: 0,
        grandTotal
      };
      const res = await orderApi.createOrder(orderPayload);
      toast.success('Order completed successfully!');
      setCart([]);
      setCustomer(null);
      setShowCheckout(false);
      // Real app would trigger receipt print here
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
  };`;
content = content.replace(new RegExp(checkoutOld, 'm'), checkoutNew);

// UI Update
content = content.replace(
  "onCheckout={handleCheckout}",
  "onCheckout={() => setShowCheckout(true)}"
);

content = content.replace(
  "customerName=\"\"",
  "customerName={customer?.name || ''}"
);

content = content.replace(
  "onOpenCustomerModal={() => toast('Customer search opening...')}",
  "onOpenCustomerModal={() => setShowCustomer(true)}"
);

// Modals inclusion before closing div
content = content.replace(
  "    </div>\n  );\n};\n\nexport default POSPage;",
  `      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} onConfirm={handleCheckoutConfirm} grandTotal={grandTotal} />
      <CustomerModal isOpen={showCustomer} onClose={() => setShowCustomer(false)} onSelectCustomer={setCustomer} />
    </div>
  );
};

export default POSPage;`
);

fs.writeFileSync('client/src/pages/pos/POSPage.tsx', content);
