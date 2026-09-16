import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, BanknotesIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  
  const [formData, setFormData] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', paymentTerms: '' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', formData);
      setShowModal(false);
      setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', paymentTerms: '' });
      fetchSuppliers();
      toast.success('Supplier created');
    } catch (error) {
      toast.error('Failed to save supplier');
    }
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/suppliers/${selectedSupplier._id}/pay`, { amount: paymentAmount });
      setShowPaymentModal(false);
      fetchSuppliers();
      toast.success('Payment logged successfully');
    } catch (error) {
      toast.error('Failed to log payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to disable this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
        toast.success('Supplier removed');
      } catch (error) {
        toast.error('Failed to delete supplier');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BriefcaseIcon className="w-6 h-6 text-indigo-500" /> Vendor Management
          </h1>
          <p className="text-gray-500 font-bold mt-1">Manage suppliers, GST details, and outstanding balances</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Vendor Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Payment Terms</th>
                <th className="px-6 py-4">Outstanding Dues</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center font-bold text-gray-400">Loading Vendors...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center font-bold text-gray-400">No suppliers found.</td></tr>
              ) : (
                suppliers.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-gray-900 text-base">{s.name}</p>
                      {s.gstNumber && <p className="text-xs font-bold text-gray-400 mt-0.5">GST: {s.gstNumber}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700">{s.contactPerson || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{s.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">{s.paymentTerms || 'Immediate'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-black text-lg ${s.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{(s.outstandingBalance || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button onClick={() => { setSelectedSupplier(s); setPaymentAmount(s.outstandingBalance); setShowPaymentModal(true); }} className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1">
                          <BanknotesIcon className="w-4 h-4" /> Pay
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-xl shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Register New Vendor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Company / Vendor Name *</label>
                  <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Person</label>
                  <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">GSTIN Number</label>
                  <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 29ABCDE1234F1Z5" value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Payment Terms</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}>
                    <option value="">Immediate / Cash</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Log Payment</h2>
            <p className="text-gray-500 font-bold text-sm mb-6">Record a payment sent to <span className="text-indigo-600">{selectedSupplier.name}</span></p>
            
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-6">
              <p className="text-sm font-bold text-rose-700">Total Outstanding Balance</p>
              <p className="text-2xl font-black text-rose-700">₹{(selectedSupplier.outstandingBalance || 0).toFixed(2)}</p>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Payment Amount (₹) *</label>
                <input type="number" required min="0.01" step="0.01" max={selectedSupplier.outstandingBalance} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-black text-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} />
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors flex items-center gap-2"><BanknotesIcon className="w-5 h-5"/> Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
