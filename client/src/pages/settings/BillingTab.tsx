import React, { useState } from 'react';
import { ReceiptText, Save, Printer } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function BillingTab({ org, onUpdate }: any) {
  const [formData, setFormData] = useState({
    invoicePrefix: org.billing?.invoicePrefix || 'INV',
    autoNumbering: org.billing?.autoNumbering ?? true,
    financialYearReset: org.billing?.financialYearReset ?? true,
    receiptHeader: org.billing?.receiptHeader || '',
    receiptFooter: org.billing?.receiptFooter || '',
    thankYouMessage: org.billing?.thankYouMessage || 'Thank you for your visit!',
    showQrCode: org.billing?.showQrCode ?? false,
    printSize: org.billing?.printSize || '80mm'
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/organization/me', { billing: formData });
      toast.success('Billing settings updated');
      onUpdate();
    } catch {
      toast.error('Failed to update billing settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><ReceiptText className="w-6 h-6 text-indigo-600"/> Billing & Invoicing</h1>
        <p className="text-gray-500 font-bold mt-1">Configure invoice generation and printed receipt templates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2">Invoice Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Invoice Prefix</label>
              <input type="text" value={formData.invoicePrefix} onChange={e => setFormData({...formData, invoicePrefix: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. INV or BLR" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Receipt Print Size</label>
              <select value={formData.printSize} onChange={e => setFormData({...formData, printSize: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="58mm">58mm (Small Thermal)</option>
                <option value="80mm">80mm (Standard Thermal)</option>
                <option value="A4">A4 (Laser Printer)</option>
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.autoNumbering} onChange={e => setFormData({...formData, autoNumbering: e.target.checked})} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-gray-700">Enable Auto-Numbering</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.financialYearReset} onChange={e => setFormData({...formData, financialYearReset: e.target.checked})} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-gray-700">Reset Invoice Sequence at Financial Year End (April 1)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2 flex items-center gap-2"><Printer className="w-5 h-5"/> Receipt Template</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Custom Header (e.g. GSTIN, Address)</label>
                <textarea rows={3} value={formData.receiptHeader} onChange={e => setFormData({...formData, receiptHeader: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Thank You Message</label>
                <input type="text" value={formData.thankYouMessage} onChange={e => setFormData({...formData, thankYouMessage: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Terms & Conditions / Return Policy</label>
                <textarea rows={2} value={formData.receiptFooter} onChange={e => setFormData({...formData, receiptFooter: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.showQrCode} onChange={e => setFormData({...formData, showQrCode: e.target.checked})} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-gray-700">Print UPI Payment QR Code on Receipt</span>
              </label>
            </div>
            
            {/* Live Preview */}
            <div className="bg-gray-100 p-6 rounded-2xl flex justify-center">
              <div className="bg-white w-64 p-4 shadow-sm border border-gray-200 text-center text-xs font-mono">
                <p className="font-bold text-lg">{org.brandName || org.name}</p>
                <p className="whitespace-pre-line mt-2">{formData.receiptHeader || '123 Restaurant St.\nGST: 29ABCDE1234F1Z5'}</p>
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                <p className="text-left font-bold">{formData.invoicePrefix}-2026-0001</p>
                <p className="text-left">Date: {new Date().toLocaleDateString()}</p>
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                <div className="flex justify-between"><span>1x Burger</span><span>₹150</span></div>
                <div className="flex justify-between"><span>2x Fries</span><span>₹100</span></div>
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                <div className="flex justify-between font-bold text-sm"><span>Total</span><span>₹250</span></div>
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                <p className="mt-4 font-bold">{formData.thankYouMessage}</p>
                <p className="mt-2 text-[10px] whitespace-pre-line">{formData.receiptFooter}</p>
                {formData.showQrCode && <div className="mt-4 w-16 h-16 bg-gray-200 mx-auto flex items-center justify-center border border-gray-300">QR</div>}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Save className="w-5 h-5"/> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
