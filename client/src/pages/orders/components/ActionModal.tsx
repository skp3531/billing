import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'REFUND' | 'VOID' | 'CANCEL';
  onSubmit: (reason: string, authBy: string) => void;
}

export const ActionModal = ({ isOpen, onClose, title, type, onSubmit }: ActionModalProps) => {
  const [reason, setReason] = useState('');
  const [authBy, setAuthBy] = useState('');

  const reasons = {
    REFUND: ['Wrong Item', 'Quality Issue', 'Customer Cancellation', 'Duplicate Billing', 'Other'],
    VOID: ['Order Entry Error', 'Payment Failed', 'Test Order', 'Other'],
    CANCEL: ['Customer Changed Mind', 'Out of Stock', 'Too Much Wait Time', 'Other']
  }[type];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className={clsx("w-5 h-5", type === 'REFUND' ? 'text-amber-500' : 'text-rose-500')} />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Reason for {type}</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {reasons.map(r => (
                <button 
                  key={r} 
                  onClick={() => setReason(r)}
                  className={clsx("px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors", reason === r ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500 min-h-[80px]" 
              placeholder="Additional details..." 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Authorized By</label>
            <input 
              required 
              type="text" 
              value={authBy} 
              onChange={e => setAuthBy(e.target.value)} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500" 
              placeholder="Manager PIN or Name" 
            />
          </div>

          <button 
            onClick={() => { onSubmit(reason, authBy); setReason(''); setAuthBy(''); }}
            disabled={!reason || !authBy}
            className="w-full py-3 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5"/> Confirm {type}
          </button>
        </div>
      </div>
    </div>
  );
};
