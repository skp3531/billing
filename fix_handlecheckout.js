const fs = require('fs');
let pos = fs.readFileSync('client/src/pages/pos/POSPage.tsx', 'utf8');

const checkoutOld = `  const handleCheckout = () => {
    if (cart.length === 0) return;
    toast.success('Checkout flow opening...');
    // Real implementation will open payment modal
  };`;

const checkoutNew = `  const handleCheckoutConfirm = async (method: PaymentMethod, splits?: any[]) => {
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
  };`;

pos = pos.replace(checkoutOld, checkoutNew);
fs.writeFileSync('client/src/pages/pos/POSPage.tsx', pos);
