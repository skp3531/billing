import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Search, UserPlus, Phone } from 'lucide-react';
import { searchCustomers, createCustomer } from '../../../api/customer.api';
import { toast } from 'react-hot-toast';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: any) => void;
}

export const CustomerModal = ({ isOpen, onClose, onSelectCustomer }: CustomerModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (query.length > 2) {
      const timer = setTimeout(() => {
        searchCustomers(query).then(setResults).catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cust = await createCustomer({ name: newName, phone: newPhone });
      toast.success('Customer created!');
      onSelectCustomer(cust);
      onClose();
    } catch (err) {
      toast.error('Failed to create customer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Select Customer</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setIsCreating(false)} className={`flex-1 py-2 font-bold rounded-lg transition-colors ${!isCreating ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>Search</button>
            <button onClick={() => setIsCreating(true)} className={`flex-1 py-2 font-bold rounded-lg transition-colors ${isCreating ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>Add New</button>
          </div>

          {!isCreating ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or phone..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none transition-colors" />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {results.map(r => (
                  <button key={r._id} onClick={() => { onSelectCustomer(r); onClose(); }} className="w-full text-left p-3 border border-gray-100 hover:border-amber-300 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-lg">{r.name.charAt(0)}</div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center w-full">
                        <p className="font-bold text-gray-900 leading-none">{r.name}</p>
                        <span className="text-[10px] uppercase font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{r.tier || 'BRONZE'}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</p>
                        <p className="text-xs font-bold text-amber-600">{r.loyaltyPoints || 0} pts</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500" />
              </div>
              <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-2"><UserPlus className="w-5 h-5"/> Create Customer</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
