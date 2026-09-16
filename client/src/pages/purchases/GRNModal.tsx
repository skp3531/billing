import React, { useState, useEffect } from 'react';
import { X, PackageCheck, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function GRNModal({ po, onClose, onSave }: any) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    invoiceNumber: po?.invoiceNumber || '',
    amountPaid: po?.amountPaid || 0,
    paymentStatus: po?.paymentStatus || 'UNPAID',
    items: po?.items?.map((i: any) => ({
      ...i,
      acceptedQty: i.acceptedQty || i.orderedQty,
      damagedQty: i.damagedQty || 0,
      rejectedQty: i.rejectedQty || 0
    })) || []
  });
  
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    api.get('/inventory').then(res => setMaterials(res.data.data)).catch();
  }, []);

  const getMaterialName = (id: string) => {
    const mat = materials.find(m => m._id === id || false);
    // If populated
    const populated = po?.items?.find((i:any) => i.rawMaterialId?._id === id);
    if (populated?.rawMaterialId?.name) return populated.rawMaterialId.name;
    return mat?.name || 'Unknown Material';
  };

  const handleQtyChange = (index: number, field: string, val: number) => {
    const newItems = [...formData.items];
    newItems[index][field] = val;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNumber) return toast.error('Supplier Invoice Number is required for GRN');

    try {
      setSaving(true);
      await api.patch(`/purchases/${po._id}/status`, {
        ...formData,
        status: 'RECEIVED'
      });
      toast.success('GRN Processed & Inventory Updated!');
      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to process GRN');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <PackageCheck className="w-6 h-6 text-emerald-500" /> Goods Receipt Note
            </h2>
            <p className="text-gray-500 font-bold text-sm mt-1">Receive PO {po.poNumber} and update live inventory</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <form id="grn-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">Supplier Invoice No. *</label>
                <input required type="text" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="INV-2024-..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">Payment Status</label>
                <select required value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})} className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                  <option value="UNPAID">Unpaid (Add to Vendor Ledger)</option>
                  <option value="PARTIAL">Partially Paid</option>
                  <option value="PAID">Fully Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">Amount Paid Now (₹)</label>
                <input type="number" required min="0" max={po.grandTotal || po.totalAmount} step="0.01" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: Number(e.target.value)})} className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                <p className="text-xs font-bold text-blue-700 mt-1">Total Bill: ₹{(po.grandTotal || po.totalAmount).toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Raw Material</div>
                <div className="col-span-2 text-center">Ordered Qty</div>
                <div className="col-span-2 text-center">Accepted Qty <br/><span className="text-[10px] text-emerald-500">(Adds to Stock)</span></div>
                <div className="col-span-2 text-center">Damaged Qty</div>
                <div className="col-span-2 text-center">Rejected Qty</div>
              </div>
              
              <div className="divide-y divide-gray-50">
                {formData.items.map((item: any, idx: number) => {
                   const matId = item.rawMaterialId?._id || item.rawMaterialId;
                   return (
                  <div key={idx} className="grid grid-cols-12 p-4 items-center gap-4 hover:bg-gray-50">
                    <div className="col-span-4 font-bold text-gray-900">
                      {getMaterialName(matId)}
                    </div>
                    <div className="col-span-2 text-center font-black text-gray-500">
                      {item.orderedQty}
                    </div>
                    <div className="col-span-2">
                      <input type="number" required min="0" step="0.01" value={item.acceptedQty} onChange={(e) => handleQtyChange(idx, 'acceptedQty', Number(e.target.value))} className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg outline-none font-black text-emerald-700 text-center" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" required min="0" step="0.01" value={item.damagedQty} onChange={(e) => handleQtyChange(idx, 'damagedQty', Number(e.target.value))} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg outline-none font-bold text-amber-700 text-center" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" required min="0" step="0.01" value={item.rejectedQty} onChange={(e) => handleQtyChange(idx, 'rejectedQty', Number(e.target.value))} className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none font-bold text-rose-700 text-center" />
                    </div>
                  </div>
                )})}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-amber-800">Warning: Submitting this GRN will irreversibly update live inventory based on the "Accepted Qty" column. Ensure physical stock matches these values before confirming.</p>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" form="grn-form" disabled={saving} className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? 'Processing...' : 'Confirm GRN & Update Inventory'}
          </button>
        </div>

      </div>
    </div>
  );
}
