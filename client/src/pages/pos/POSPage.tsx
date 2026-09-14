import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { db } from '../../utils/db';
import { Category, MenuItem, OrderItemModifier, MenuVariant, OrderType, PaymentMethod } from '../../types';
import { getCategories } from '../../api/category.api';
import { getMenuItems } from '../../api/menu.api';
import { orderApi } from '../../api/order.api';

import { POSHeader } from './components/POSHeader';
import { POSSidebar } from './components/POSSidebar';
import { ProductGrid } from './components/ProductGrid';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerModal } from './components/CustomerModal';

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

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  
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
      if (e.key === 'F2') { e.preventDefault(); setCart([]); toast('New Sale Started'); }
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
        orderType,
        paymentMethod: method,
        splitPayments: splits,
        paymentStatus: (method === 'PENDING' ? 'UNPAID' : 'PAID') as any,
        customer: customer ? { name: customer.name, phone: customer.phone } : undefined,
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

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
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
          customerName={customer?.name || ''}
          onOpenCustomerModal={() => setShowCustomer(true)}
        />
      </div>
      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} onConfirm={handleCheckoutConfirm} grandTotal={grandTotal} />
      <CustomerModal isOpen={showCustomer} onClose={() => setShowCustomer(false)} onSelectCustomer={setCustomer} />
    </div>
  );
};

export default POSPage;
