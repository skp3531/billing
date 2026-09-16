import React, { useState, useEffect } from 'react';
import { X, UploadCloud, ScanLine, Receipt, FileText, IndianRupee } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function ExpenseModal({ expense, onClose, onSave }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [formData, setFormData] = useState<any>({
    expenseNumber: expense?.expenseNumber || '',
    categoryId: expense?.categoryId?._id || '',
    supplierId: expense?.supplierId?._id || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    amount: expense?.amount || 0,
    taxAmount: expense?.taxAmount || 0,
    paymentMode: expense?.paymentMode || 'CASH',
    invoiceNumber: expense?.invoiceNumber || '',
    gstin: expense?.gstin || '',
    description: expense?.description || '',
    status: expense?.status || 'PENDING_APPROVAL'
  });

  useEffect(() => {
    Promise.all([
      api.get('/expenses/categories').catch(() => ({ data: { data: [] } })),
      api.get('/suppliers').catch(() => ({ data: { data: [] } }))
    ]).then(([catRes, supRes]) => {
      setCategories(catRes.data.data);
      setSuppliers(supRes.data.data);
    });
  }, []);

  const simulateOCRScan = () => {
    setScanning(true);
    setTimeout(() => {
      setFormData((prev: any) => ({
        ...prev,
        amount: 4250,
        taxAmount: 212.5,
        invoiceNumber: 'INV-OCR-9921',
        gstin: '29ABCDE1234F1Z5',
        description: 'Auto-filled via AI OCR Scanner',
        date: new Date().toISOString().split('T')[0]
      }));
      setScanning(false);
      toast.success('AI successfully extracted bill details!');
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId && categories.length > 0) return toast.error('Category is required');
    if (formData.amount <= 0) return toast.error('Amount must be greater than 0');

    try {
      setSaving(true);
      if (expense) {
        // Handle full update if endpoint existed, for now just status
        await api.patch(`/expenses/${expense._id}/status`, { status: formData.status });
        toast.success('Expense status updated');
      } else {
        await api.post('/expenses', formData);
        toast.success('Expense successfully logged');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{expense ? 'Manage Expense' : 'Log New Expense'}</h2>
            <p className="text-gray-500 font-bold text-sm mt-1">Record financial outflows and route for approval</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left: OCR & Upload */}
          <div className="col-span-1 space-y-6">
            <div className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-gray-900">Upload Receipt</h3>
                <p className="text-xs font-bold text-gray-500 mt-1">JPEG, PNG, or PDF</p>
              </div>
              
              <button onClick={simulateOCRScan} disabled={scanning} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-75">
                {scanning ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Scanning AI...</span>
                ) : (
                  <><ScanLine className="w-5 h-5" /> Auto-Fill via AI OCR</>
                )}
              </button>
              
              <button className="w-full bg-white text-indigo-600 border border-indigo-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                <UploadCloud className="w-5 h-5" /> Manual Upload
              </button>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Payment Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Payment Mode</label>
                  <select value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-bold text-sm">
                    <option value="CASH">Cash</option>
                    <option value="PETTY_CASH">Petty Cash</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Approval Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={clsx("w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-black text-sm", formData.status === 'PAID' ? "text-emerald-600" : formData.status === 'PENDING_APPROVAL' ? "text-amber-600" : "text-gray-700")}>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="APPROVED">Approved (Unpaid)</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Manual Form */}
          <div className="col-span-1 md:col-span-2">
            <form id="expense-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date *</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Expense Category *</label>
                  <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Vendor / Supplier (Optional)</label>
                  <select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                    <option value="">No vendor mapped</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Invoice / Bill Number</label>
                  <input type="text" placeholder="e.g. INV-1002" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Vendor GSTIN</label>
                  <input type="text" placeholder="e.g. 29ABCDE1234F1Z5" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Base Amount (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" required min="0" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-rose-100 rounded-xl outline-none focus:border-rose-500 font-black text-lg text-rose-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">GST / Tax Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" min="0" step="0.01" value={formData.taxAmount} onChange={e => setFormData({...formData, taxAmount: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-black text-lg text-gray-700" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description / Notes</label>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="What was this expense for?"></textarea>
                </div>

              </div>

              {/* Live Totals Bar */}
              <div className="mt-6 bg-gray-900 p-5 rounded-2xl flex justify-between items-center text-white shadow-xl shadow-gray-900/20">
                <div>
                  <p className="text-gray-400 text-sm font-bold">Total Expense Impact</p>
                  <p className="text-xs text-gray-500 mt-0.5">Base + Tax Amount</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">₹{((formData.amount || 0) + (formData.taxAmount || 0)).toFixed(2)}</p>
                </div>
              </div>

            </form>
          </div>

        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" form="expense-form" disabled={saving || scanning} className="px-8 py-2.5 bg-rose-600 text-white rounded-xl font-black shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save & Route for Approval'}
          </button>
        </div>

      </div>
    </div>
  );
}
