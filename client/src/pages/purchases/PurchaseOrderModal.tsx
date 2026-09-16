import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function PurchaseOrderModal({ po, onClose, onSave }: any) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<any>({
    supplierId: po?.supplierId?._id || '',
    deliveryDate: po?.deliveryDate ? new Date(po.deliveryDate).toISOString().split('T')[0] : '',
    notes: po?.notes || '',
    items: po?.items || [],
  });

  useEffect(() => {
    Promise.all([
      api.get('/suppliers'),
      api.get('/inventory')
    ]).then(([supRes, matRes]) => {
      setSuppliers(supRes.data.data);
      setMaterials(matRes.data.data);
    }).catch(() => toast.error('Failed to load form dependencies'));
  }, []);

  const handleAddItem = () => {
    setFormData((prev: any) => ({
      ...prev,
      items: [...prev.items, { rawMaterialId: '', orderedQty: 1, unitCost: 0, total: 0 }]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto calculate totals if qty or cost changes
    if (field === 'orderedQty' || field === 'unitCost' || field === 'rawMaterialId') {
      if (field === 'rawMaterialId') {
        const mat = materials.find(m => m._id === value);
        if (mat) newItems[index].unitCost = mat.unitCost || 0;
      }
      newItems[index].total = newItems[index].orderedQty * newItems[index].unitCost;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const totalAmount = formData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const taxAmount = totalAmount * 0.05; // Dummy 5% tax for now, could be dynamic
    const grandTotal = totalAmount + taxAmount;
    return { totalAmount, taxAmount, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return toast.error('Add at least one item to the PO');
    if (!formData.supplierId) return toast.error('Select a supplier');

    try {
      setSaving(true);
      const totals = calculateTotals();
      const payload = {
        ...formData,
        ...totals,
        status: 'ORDERED'
      };

      if (po) {
        await api.patch(`/purchases/${po._id}/status`, payload);
        toast.success('Purchase Order updated');
      } else {
        await api.post('/purchases', payload);
        toast.success('Purchase Order Created');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to save PO');
    } finally {
      setSaving(false);
    }
  };

  const { totalAmount, taxAmount, grandTotal } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{po ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
            <p className="text-gray-500 font-bold text-sm mt-1">Draft a new PO and send to vendor</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <form id="po-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Supplier *</label>
                <select required value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                  <option value="">Select Vendor...</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Expected Delivery Date</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">PO Notes / Terms</label>
                <div className="relative">
                  <FileText className="w-5 h-5 absolute left-3 top-4 text-gray-400" />
                  <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="E.g., Delivery between 9AM - 11AM..."></textarea>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-gray-900">Line Items</h3>
                <button type="button" onClick={handleAddItem} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-5">Raw Material</div>
                  <div className="col-span-2">Ordered Qty</div>
                  <div className="col-span-2">Unit Cost (₹)</div>
                  <div className="col-span-2 text-right">Line Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                <div className="divide-y divide-gray-50">
                  {formData.items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 p-3 items-center gap-4 hover:bg-gray-50">
                      <div className="col-span-5">
                        <select required value={item.rawMaterialId} onChange={(e) => updateItem(idx, 'rawMaterialId', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-bold text-sm">
                          <option value="">Select Material...</option>
                          {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.unit})</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" required min="0.01" step="0.01" value={item.orderedQty} onChange={(e) => updateItem(idx, 'orderedQty', Number(e.target.value))} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-bold text-sm" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" required min="0" step="0.01" value={item.unitCost} onChange={(e) => updateItem(idx, 'unitCost', Number(e.target.value))} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-bold text-sm" />
                      </div>
                      <div className="col-span-2 text-right font-black text-gray-700">
                        ₹{(item.total || 0).toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button type="button" onClick={() => setFormData({ ...formData, items: formData.items.filter((_:any, i:number) => i !== idx) })} className="text-gray-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.items.length === 0 && (
                    <div className="p-8 text-center text-gray-400 font-bold">No items added to this Purchase Order yet.</div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              {formData.items.length > 0 && (
                <div className="flex justify-end mt-6">
                  <div className="w-72 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                      <span>Estimated Tax (5%)</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-black text-gray-900">
                      <span>Grand Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" form="po-form" disabled={saving} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? 'Processing...' : 'Confirm Purchase Order'}
          </button>
        </div>

      </div>
    </div>
  );
}
