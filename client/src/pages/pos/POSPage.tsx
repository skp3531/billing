import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Category, MenuItem, Order, OrderItemModifier, MenuVariant, OrderType, PaymentMethod } from '../../types';
import { getCategories } from '../../api/category.api';
import { getMenuItems } from '../../api/menu.api';
import { orderApi } from '../../api/order.api';
import { printerApi, PrinterSetting } from '../../api/printer.api';
import { getCustomers, createCustomer, searchCustomers } from '../../api/customer.api';
import ReceiptTemplate from '../../components/print/ReceiptTemplate';
import { PlusIcon, MinusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  const { currentOutlet, organization } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Item Config Modal
  const [configuringItem, setConfiguringItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifier[]>([]);
  
  // Checkout Modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchParams] = useSearchParams();
  const [tableNumber, setTableNumber] = useState(searchParams.get('table') || '');
  const [submitting, setSubmitting] = useState(false);
  const [printerSettings, setPrinterSettings] = useState<PrinterSetting[]>([]);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  useEffect(() => {
    const fetchPrinterSettings = async () => {
      if (currentOutlet) {
        try {
          const settings = await printerApi.getSettings(currentOutlet._id);
          setPrinterSettings(settings);
        } catch (e) {}
      }
    };
    fetchPrinterSettings();

    getCustomers().then(setCustomers).catch(() => {});
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0) setSelectedCategoryId(data[0]._id);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    if (!selectedCategoryId) return;
    setItemsLoading(true);
    try {
      const data = await getMenuItems({ categoryId: selectedCategoryId });
      setMenuItems(data);
    } catch (err) {
      toast.error('Failed to load menu items');
    } finally {
      setItemsLoading(false);
    }
  };

  
  const filteredMenuItems = menuItems.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.shortCode && item.shortCode.toLowerCase().includes(q));
  });

  const handleItemClick = (item: MenuItem) => {
    if ((item.variants && item.variants.length > 0) || (item.modifierGroups && item.modifierGroups.length > 0)) {
      setConfiguringItem(item);
      setSelectedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : null);
      setSelectedModifiers([]);
    } else {
      addToCart({
        cartItemId: Math.random().toString(36).substring(7),
        menuItem: item,
        modifiers: [],
        quantity: 1,
        unitPrice: item.basePrice,
        subtotal: item.basePrice
      });
    }
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      // Check if identical item exists (same id, variant, modifiers)
      const existing = prev.find(i => 
        i.menuItem._id === item.menuItem._id && 
        i.variant?.name === item.variant?.name &&
        JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers)
      );
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity, subtotal: i.subtotal + item.subtotal } : i);
      }
      return [...prev, item];
    });
    toast.success(`${item.menuItem.name} added`);
  };

  const confirmItemConfig = () => {
    if (!configuringItem) return;
    const base = selectedVariant ? (selectedVariant.price || configuringItem.basePrice) : configuringItem.basePrice;
    const modsPrice = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
    const unitPrice = base + modsPrice;
    
    addToCart({
      cartItemId: Math.random().toString(36).substring(7),
      menuItem: configuringItem,
      variant: selectedVariant || undefined,
      modifiers: selectedModifiers,
      quantity: 1,
      unitPrice,
      subtotal: unitPrice
    });
    
    setConfiguringItem(null);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQ = item.quantity + delta;
        if (newQ <= 0) return item;
        return { ...item, quantity: newQ, subtotal: newQ * item.unitPrice };
      }
      return item;
    }));
  };

  const removeCartItem = (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const toggleModifier = (modName: string, price: number) => {
    setSelectedModifiers(prev => {
      const exists = prev.find(m => m.name === modName);
      if (exists) return prev.filter(m => m.name !== modName);
      return [...prev, { name: modName, price }];
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.05; // 5% tax hardcoded for now
  const grandTotal = subtotal + tax;

  const handleCustomerSearch = async (value: string) => {
    setCustomerPhone(value);
    setCustomerName(value);
    setSelectedCustomerId(null);
    if (value.replace(/\D/g, '').length >= 3) {
      setSearchingCustomers(true);
      try {
        const results = await searchCustomers(value);
        setCustomerSearchResults(results);
        setShowCustomerDropdown(true);
      } catch {
        setCustomerSearchResults([]);
      } finally {
        setSearchingCustomers(false);
      }
    } else {
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomerId(customer._id);
    setCustomerPhone(customer.phone || '');
    setCustomerName(customer.name || '');
    setShowCustomerDropdown(false);
    setCustomerSearchResults([]);
  };

  
  const isKitchenEnabled = organization?.modulesEnabled?.kitchen !== false;

  const handleCheckout = async () => {
    if (!currentOutlet) return toast.error('No outlet selected');
    setSubmitting(true);
    
    let finalCustomerName = customerName;
    let finalCustomerPhone = customerPhone;

    try {
      if (customerPhone && !selectedCustomerId) {
        // New customer - create them first
        try {
          const newCust = await createCustomer({ name: customerName || 'Guest', phone: customerPhone });
          setCustomers(prev => [...prev, newCust]);
          finalCustomerName = newCust.name;
          // Set selected customer ID so we don't recreate them if they check out again
          setSelectedCustomerId(newCust._id);
        } catch (custErr) {
          console.error("Failed to create customer:", custErr);
        }
      }

      await orderApi.createOrder({
        outletId: currentOutlet._id,
        type: orderType,
        paymentMethod,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
        customerId: selectedCustomerId || undefined,
        customer: { name: finalCustomerName, phone: finalCustomerPhone },
        items: cart.map(c => ({
          menuItemId: c.menuItem._id,
          name: c.menuItem.name,
          variant: c.variant?.name,
          modifiers: c.modifiers,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal
        })),
        subtotal,
        taxTotal: tax,
        discountTotal: 0,
        grandTotal,
        status: 'PENDING',
        paymentStatus: paymentMethod === 'cash' ? 'completed' : 'pending'
      });
      toast.success('Order placed successfully!');
      setCart([]);
      setShowCheckout(false);
      setCustomerName('');
      setCustomerPhone('');
      setTableNumber('');
      setSelectedCustomerId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="h-full flex">
      {/* Left Pane - POS */}
      <div className="w-2/3 flex flex-col bg-[#fcfaf7] h-full border-r">
        
        {/* Search Bar */}
        <div className="p-6 pb-2">
          <input 
            type="text" 
            placeholder="Search menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/2 px-5 py-3 rounded-full border border-gray-200 focus:border-[#ec6247] focus:ring-1 focus:ring-[#ec6247] shadow-sm text-sm"
          />
        </div>

        {/* Categories Strip */}
        <div className="px-6 py-4 flex gap-3 overflow-x-auto hide-scrollbar mb-2">
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all border ${selectedCategoryId === cat._id ? 'bg-[#ec6247] text-white border-[#ec6247] shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-transparent">
          {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec6247]" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenuItems.map(item => (
                <button
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white p-5 rounded-3xl border border-gray-100 hover:shadow-md hover:border-gray-300 transition-all flex flex-col text-left h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/60 rounded-bl-full -z-10"></div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="flex-1 z-10">
                    <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{typeof item.categoryId === 'object' ? (item.categoryId as any).name : 'Item'}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-end w-full z-10">
                    <span className="font-bold text-red-500">₹{item.basePrice.toFixed(2)}</span>
                    <span className="text-orange-500 font-light text-2xl">+</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Cart */}
      <div className="w-1/3 flex flex-col bg-white h-full">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{cart.length} Items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-4">🛒</span>
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="border rounded-lg p-3 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.menuItem.name}</h4>
                    {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                    {item.modifiers.map(m => (
                      <p key={m.name} className="text-xs text-gray-500">+ {m.name}</p>
                    ))}
                  </div>
                  <span className="font-bold">₹{item.subtotal}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="text-gray-600 hover:text-amber-600"><MinusIcon className="w-4 h-4" /></button>
                    <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="text-gray-600 hover:text-amber-600"><PlusIcon className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeCartItem(item.cartItemId)} className="text-red-400 hover:text-red-600 p-1">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold text-lg py-3 rounded-xl transition-colors shadow-md"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Item Config Modal */}
      {configuringItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{configuringItem.name}</h3>
              <button onClick={() => setConfiguringItem(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {configuringItem.variants && configuringItem.variants.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Select Size/Variant</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {configuringItem.variants.map(v => (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedVariant?.name === v.name ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{v.name}</div>
                        <div className="text-amber-600 text-sm">₹{v.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {configuringItem.modifierGroups && configuringItem.modifierGroups.map(group => (
                <div key={group.name}>
                  <h4 className="font-semibold text-gray-800 mb-3">{group.name} {group.required && <span className="text-red-500 text-xs">*</span>}</h4>
                  <div className="space-y-2">
                    {group.options.map(opt => (
                      <label key={opt.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedModifiers.some(m => m.name === opt.name)}
                            onChange={() => toggleModifier(opt.name, opt.price)}
                            className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="font-medium text-gray-700">{opt.name}</span>
                        </div>
                        <span className="text-gray-500">+₹{opt.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={confirmItemConfig}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Checkout</h3>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['dine_in', 'takeaway', 'delivery'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type as OrderType)}
                      className={`p-3 rounded-lg border font-medium capitalize transition-colors ${
                        orderType === type ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {orderType === 'dine_in' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    placeholder="e.g. T4"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Customer (Phone or Name)</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    placeholder="Type to search..."
                    autoComplete="off"
                  />
                  {searchingCustomers && (
                    <div className="absolute right-3 top-8 text-gray-400 text-xs">Searching...</div>
                  )}
                  {showCustomerDropdown && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {customerSearchResults.length > 0 ? (
                        customerSearchResults.map((c) => (
                          <button
                            key={c._id}
                            type="button"
                            onMouseDown={() => handleSelectCustomer(c)}
                            className="w-full text-left px-4 py-2 hover:bg-amber-50 text-sm flex justify-between items-center"
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="text-gray-400 text-xs">{c.phone}</span>
                          </button>
                        ))
                      ) : null}
                      {!searchingCustomers && (
                        <button
                          type="button"
                          onMouseDown={() => { setShowCustomerDropdown(false); setSelectedCustomerId(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-amber-600 font-medium border-t"
                        >
                          + Add as new customer
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (If New)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    placeholder="Optional"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {['cash', 'card', 'upi'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as PaymentMethod)}
                      className={`p-3 rounded-lg border font-medium capitalize transition-colors ${
                        paymentMethod === method ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900"><span>Total to Pay</span><span>₹{grandTotal.toFixed(2)}</span></div>
              </div>

            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={submitting || (orderType === 'dine_in' && !tableNumber)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors disabled:bg-amber-300"
              >
                {submitting ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}


      
      {/* Receipt Modal */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[#fcfaf7] rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 text-center border-b border-gray-200 bg-white relative">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Payment Received</p>
              <h3 className="text-3xl font-bold text-gray-900 font-serif">Receipt ready.</h3>
              <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 bg-white flex-1">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h4 className="font-bold text-lg">{organization?.name || 'Store'}</h4>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{completedOrder.type.replace('_', ' ')} RECEIPT</p>
              </div>

              <div className="flex justify-between text-sm text-gray-500 mb-6 border-b pb-4">
                <span>Order #{completedOrder.orderNumber}</span>
                <span>{new Date(completedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="space-y-3 mb-6">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800 text-sm">
                    <span>{item.quantity} × {item.name}</span>
                    <span className="font-medium">₹{(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span>₹{completedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Tax</span>
                  <span>₹{completedOrder.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-dashed pt-4 mt-2">
                  <span>Total</span>
                  <span>₹{completedOrder.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-medium text-gray-700 bg-gray-50 p-4 rounded-xl">
                <span>Paid via</span>
                <span className="capitalize">{completedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="p-6 bg-white border-t">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-[#2d5145] hover:bg-[#203a31] text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                Print receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      {completedOrder && organization && (
        <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[9999]">
          {printerSettings.filter(s => s.type === 'RECEIPT').map(setting => (
            Array.from({ length: setting.printCopies }).map((_, idx) => (
              <ReceiptTemplate 
                key={`${setting._id}-${idx}`} 
                order={completedOrder} 
                organization={organization} 
                settings={setting} 
              />
            ))
          ))}
        </div>
      )}
    </div>
  );
};

export default POSPage;

