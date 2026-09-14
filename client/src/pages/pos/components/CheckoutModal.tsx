import React, { useState } from 'react';
import { PaymentMethod } from '../../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreditCard, Banknote, QrCode, SplitSquareHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

interface SplitPayment {
  method: PaymentMethod;
  amount: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, splitPayments?: SplitPayment[]) => void;
  grandTotal: number;
}

export const CheckoutModal = ({ isOpen, onClose, onConfirm, grandTotal }: CheckoutModalProps) => {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  
  // Split payment state
  const [isSplit, setIsSplit] = useState(false);
  const [splitCASH, setSplitCASH] = useState<string>('');
  const [splitUPI, setSplitUPI] = useState<string>('');
  const [splitCARD, setSplitCARD] = useState<string>('');

  if (!isOpen) return null;

  const totalSplitEntered = (parseFloat(splitCASH || '0') + parseFloat(splitUPI || '0') + parseFloat(splitCARD || '0'));
  const splitBalance = grandTotal - totalSplitEntered;

  const handleSubmit = () => {
    if (isSplit) {
      if (Math.abs(splitBalance) > 0.01) {
        toast.error('Split payment amounts must exactly match the grand total');
        return;
      }
      const splits: SplitPayment[] = [];
      if (parseFloat(splitCASH) > 0) splits.push({ method: 'CASH', amount: parseFloat(splitCASH) });
      if (parseFloat(splitUPI) > 0) splits.push({ method: 'UPI', amount: parseFloat(splitUPI) });
      if (parseFloat(splitCARD) > 0) splits.push({ method: 'CARD', amount: parseFloat(splitCARD) });
      onConfirm('SPLIT', splits);
    } else {
      onConfirm(method);
    }
  };

  const methods = [
    { id: 'CASH', icon: Banknote, label: 'Cash' },
    { id: 'UPI', icon: QrCode, label: 'UPI / QR' },
    { id: 'CARD', icon: CreditCard, label: 'Card' }
  ];

  const quickCash = [100, 200, 500, 1000, 2000];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Checkout</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Select payment method to complete order</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Payment Methods */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-100 p-4 space-y-3 overflow-y-auto">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => { setMethod(m.id as PaymentMethod); setIsSplit(false); }}
                className={clsx(
                  "w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                  !isSplit && method === m.id ? "border-amber-500 bg-amber-50 text-amber-700" : "border-transparent bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-200 shadow-sm"
                )}
              >
                <m.icon className="w-8 h-8" />
                <span className="font-bold text-sm">{m.label}</span>
              </button>
            ))}
            
            <div className="my-4 border-t border-gray-200"></div>

            <button
              onClick={() => setIsSplit(true)}
              className={clsx(
                "w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                isSplit ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-transparent bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-200 shadow-sm"
              )}
            >
              <SplitSquareHorizontal className="w-8 h-8" />
              <span className="font-bold text-sm">Split Bill</span>
            </button>
          </div>

          {/* Right: Payment Details */}
          <div className="w-2/3 p-6 flex flex-col bg-white overflow-y-auto">
            
            <div className="text-center mb-8 bg-gray-900 text-white py-6 rounded-2xl shadow-inner">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Due</p>
              <h1 className="text-5xl font-black tracking-tight">₹{grandTotal.toFixed(2)}</h1>
            </div>

            {/* Split UI */}
            {isSplit ? (
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cash Amount</label>
                    <input type="number" value={splitCASH} onChange={(e) => setSplitCASH(e.target.value)} className="w-full text-xl font-bold p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">UPI Amount</label>
                    <input type="number" value={splitUPI} onChange={(e) => setSplitUPI(e.target.value)} className="w-full text-xl font-bold p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Amount</label>
                  <input type="number" value={splitCARD} onChange={(e) => setSplitCARD(e.target.value)} className="w-full text-xl font-bold p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="0.00" />
                </div>
                
                <div className={clsx("p-4 rounded-xl border font-bold text-center", splitBalance === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200")}>
                  Remaining to split: ₹{splitBalance.toFixed(2)}
                </div>
              </div>
            ) : method === 'CASH' ? (
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cash Received</label>
                  <input 
                    type="number" 
                    value={cashReceived} 
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full text-3xl font-black p-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-amber-50 outline-none transition-colors" 
                    placeholder="₹ 0.00"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {quickCash.map(amt => (
                    <button key={amt} onClick={() => setCashReceived(amt.toString())} className="py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 border border-gray-200 shadow-sm transition-colors active:scale-95">
                      ₹{amt}
                    </button>
                  ))}
                </div>
                {parseFloat(cashReceived) >= grandTotal && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <p className="text-sm font-bold text-emerald-600 uppercase">Return Change</p>
                    <p className="text-3xl font-black text-emerald-700">₹{(parseFloat(cashReceived) - grandTotal).toFixed(2)}</p>
                  </div>
                )}
              </div>
            ) : method === 'UPI' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-48 h-48 bg-gray-100 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center mb-6">
                  <QrCode className="w-16 h-16 text-gray-400" />
                  {/* Real QR would go here */}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Scan to Pay ₹{grandTotal.toFixed(2)}</h3>
                <p className="text-gray-500 font-medium">Ask the customer to scan this QR code with any UPI app (PhonePe, GPay, Paytm).</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Card Payment</h3>
                <p className="text-gray-500 font-medium">Process the payment of ₹{grandTotal.toFixed(2)} on your card swipe machine.</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isSplit && method === 'CASH' && (parseFloat(cashReceived) < grandTotal || !cashReceived)}
              className="mt-6 w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] text-lg"
            >
              Confirm {isSplit ? 'Split ' : ''}Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
