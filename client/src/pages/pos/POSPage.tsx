import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { db } from '../../utils/db';
import { Order, Category, MenuItem, OrderItemModifier, MenuVariant, OrderType, PaymentMethod } from '../../types';
import { getCategories } from '../../api/category.api';
import { getMenuItems } from '../../api/menu.api';
import { orderApi } from '../../api/order.api';

import { POSHeader } from './components/POSHeader';
import { POSSidebar } from './components/POSSidebar';
import { ProductGrid } from './components/ProductGrid';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerModal } from './components/CustomerModal';
import { cashRegisterApi, CashRegister } from '../../api/cashRegister.api';
import { ReceiptTemplate } from '../../components/print/ReceiptTemplate';
import { printerApi, PrinterSetting } from '../../api/printer.api';
import { Wallet } from 'lucide-react';

interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  variant?: MenuVariant;
  modifiers: OrderItemModifier[];
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

const POSPage = () => {
  const { currentOutlet } = useAuthStore();
  const { isOnline } = useOfflineSync();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [register, setRegister] = useState<CashRegister | null>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cashInput, setCashInput] = useState('');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [printerSettings, setPrinterSettings] = useState<PrinterSetting | null>(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(cart));
  }, [cart]);
  const [orderType, setOrderType] = useState<OrderType>(() => {
    const saved = localStorage.getItem('pos_orderType');
    return (saved as OrderType) || 'takeaway';
  });
  useEffect(() => {
    localStorage.setItem('pos_orderType', orderType);
  }, [orderType]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [customer, setCustomer] = useState<any>(() => {
    const saved = localStorage.getItem('pos_customer');
    return saved ? JSON.parse(saved) : null;
  });
  useEffect(() => {
    if (customer) localStorage.setItem('pos_customer', JSON.stringify(customer));
    else localStorage.removeItem('pos_customer');
  }, [customer]);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  
  useEffect(() => {
    fetchData();
  }, [currentOutlet]);

  const fetchData = async () => {
    if (!currentOutlet) return;
    try {
      setLoading(true);
      const [cats, items] = await Promise.all([
        getCategories(),
        getMenuItems()
      ]);
      setCategories(cats);
      setMenuItems(items.filter(i => i.active));
    } catch (err) {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); setCart([]);
      setCart([]); toast('New Sale Started'); }
      if (e.key === 'F10') { e.preventDefault(); if(cart.length > 0) setShowCheckout(true); }
      if (e.key === 'F4') { e.preventDefault(); setShowCustomer(true); }
      if (e.key === 'F8') { e.preventDefault(); handleHoldBill(); }
      if (e.key === 'F9') { e.preventDefault(); handleRecallBill(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const handleHoldBill = async () => {
    if (cart.length === 0) return;
    await db.holdBills.add({ cart, orderType, customer, createdAt: new Date() });
    toast.success('Bill placed on hold!');
    setCart([]);
    setCustomer(null);
    setLoyaltyPointsUsed(0);
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
  };

  const handleAddToCart = (item: MenuItem) => {
    // If it has variants/modifiers, we should show a modal. 
    // For now, just add base item if no variants are required.
    if (item.variants && item.variants.length > 0) {
      toast('Modifiers & Variants Modal Coming Soon');
      return;
    }

    const price = item.basePrice;
    setCart(prev => {
      const existing = prev.find(c => c.menuItem._id === item._id);
      if (existing) {
        return prev.map(c => c.cartItemId === existing.cartItemId 
          ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.unitPrice }
          : c
        );
      }
      return [...prev, {
        cartItemId: Math.random().toString(36).substr(2, 9),
        menuItem: item,
        modifiers: [],
        quantity: 1,
        unitPrice: price,
        subtotal: price
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.cartItemId === id) {
        const newQ = c.quantity + delta;
        return newQ > 0 ? { ...c, quantity: newQ, subtotal: newQ * c.unitPrice } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(c => c.cartItemId !== id));
  };

  const handleSidebarAction = (action: string) => {
    if (action === 'new') setCart([]);
    else if (action.startsWith('type_')) setOrderType(action.split('_')[1] as OrderType);
    else if (action === 'hold') handleHoldBill();
    else if (action === 'recall') handleRecallBill();
    else if (action === 'customer') setShowCustomer(true);
    else if (action === 'payment') { if(cart.length>0) setShowCheckout(true); }
    else toast(`${action} Coming Soon`);
  };

  const handleCheckoutConfirm = async (method: PaymentMethod, splits?: any[]) => {
    try {
      const orderPayload = {
        outletId: currentOutlet?._id,
        orderType,
        paymentMethod: method,
        splitPayments: splits,
        paymentStatus: (method === 'PENDING' ? 'UNPAID' : 'PAID') as any,
        customerId: customer?._id,
        customer: customer ? { name: customer.name, phone: customer.phone } : undefined,
        loyaltyPointsUsed,
        items: cart.map(c => ({
          menuItemId: c.menuItem._id,
          name: c.menuItem.name,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
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
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxTotal = cart.reduce((sum, item) => sum + (item.subtotal * (item.menuItem.taxRate / 100)), 0);
  const grandTotal = subtotal + taxTotal;

  if (loading) return <div className="h-screen bg-gray-50 flex items-center justify-center">Loading POS...</div>;


  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reg = await cashRegisterApi.open(currentOutlet!._id, Number(cashInput));
      setRegister(reg);
      setShowOpenModal(false);
      setCashInput('');
      toast.success('Register opened successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to open register');
    }
  };

  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cashRegisterApi.close(currentOutlet!._id, Number(cashInput));
      setRegister(null);
      setShowCloseModal(false);
      setCashInput('');
      setShowOpenModal(true);
      toast.success('Register closed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to close register');
    }
  };

  if (isRegisterLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold animate-pulse">Initializing Cash Register...</div>;
  }

  return (
    <>
      <ReceiptTemplate order={printOrder} settings={printerSettings} organizationName="Restaurant" />
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
      {register && (
        <div className="absolute top-4 right-[26rem] z-50">
          <button onClick={() => setShowCloseModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors">
            <Wallet className="w-5 h-5"/> End Shift
          </button>
        </div>
      )}
      <POSHeader isOnline={isOnline} salesToday={12540} ordersToday={84} />
      
      <div className="flex flex-1 overflow-hidden">
        <POSSidebar onAction={handleSidebarAction} activeOrderType={orderType} />
        
        <ProductGrid 
          categories={categories}
          menuItems={menuItems}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddToCart={handleAddToCart}
        />
        
        <CartSidebar 
          cart={cart}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          onCheckout={() => setShowCheckout(true)}
          subtotal={subtotal}
          taxTotal={taxTotal}
          grandTotal={grandTotal}
          customer={customer}
          loyaltyPointsUsed={loyaltyPointsUsed}
          setLoyaltyPointsUsed={setLoyaltyPointsUsed}
          onOpenCustomerModal={() => setShowCustomer(true)}
        />
      </div>
      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} onConfirm={handleCheckoutConfirm} grandTotal={grandTotal} />
      <CustomerModal isOpen={showCustomer} onClose={() => setShowCustomer(false)} onSelectCustomer={setCustomer} />
    </div>

      {showOpenModal && !register && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleOpenRegister} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Wallet className="w-6 h-6"/></div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Open Register</h2>
                <p className="text-sm font-bold text-gray-500">Enter starting cash float to begin shift</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Opening Cash Balance (₹)</label>
                <input type="number" required autoFocus value={cashInput} onChange={e => setCashInput(e.target.value)} className="w-full text-2xl font-black px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900" placeholder="0" />
              </div>
            </div>
            <button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black text-lg shadow-lg transition-all">Start Shift</button>
          </form>
        </div>
      )}

      {showCloseModal && register && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCloseRegister} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="bg-rose-100 p-3 rounded-xl text-rose-600"><Wallet className="w-6 h-6"/></div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Close Register</h2>
                <p className="text-sm font-bold text-gray-500">Count your physical cash drawer</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Actual Cash in Drawer (₹)</label>
                <input type="number" required autoFocus value={cashInput} onChange={e => setCashInput(e.target.value)} className="w-full text-2xl font-black px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-gray-900" placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowCloseModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
              <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-black text-lg shadow-lg transition-all">End Shift</button>
            </div>
          </form>
        </div>
      )}

    </>
  );
};

export default POSPage;
