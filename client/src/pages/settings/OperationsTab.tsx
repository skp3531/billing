import React, { useState } from 'react';
import { TabletSmartphone, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function OperationsTab({ org, onUpdate }: any) {
  const [formData, setFormData] = useState({
    tablePrefix: org.operations?.tablePrefix || 'T',
    dineInEnabled: org.operations?.dineInEnabled ?? true,
    takeawayEnabled: org.operations?.takeawayEnabled ?? true,
    deliveryEnabled: org.operations?.deliveryEnabled ?? true,
    qrOrderEnabled: org.operations?.qrOrderEnabled ?? false,
    allowNegativeStock: org.operations?.allowNegativeStock ?? false,
    maxCashierDiscount: org.operations?.maxCashierDiscount || 5,
    maxManagerDiscount: org.operations?.maxManagerDiscount || 20,
    kotPrefix: org.kitchen?.kotPrefix || 'KOT',
    autoPrintKot: org.kitchen?.autoPrint ?? true,
    kitchenRouting: org.kitchen?.kitchenRouting ?? false
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/organization/me', { 
        operations: {
          tablePrefix: formData.tablePrefix,
          dineInEnabled: formData.dineInEnabled,
          takeawayEnabled: formData.takeawayEnabled,
          deliveryEnabled: formData.deliveryEnabled,
          qrOrderEnabled: formData.qrOrderEnabled,
          allowNegativeStock: formData.allowNegativeStock,
          maxCashierDiscount: formData.maxCashierDiscount,
          maxManagerDiscount: formData.maxManagerDiscount,
        },
        kitchen: {
          kotPrefix: formData.kotPrefix,
          autoPrint: formData.autoPrintKot,
          kitchenRouting: formData.kitchenRouting
        }
      });
      toast.success('Operational rules updated');
      onUpdate();
    } catch {
      toast.error('Failed to update operations');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ label, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
      <span className="font-bold text-gray-700">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className="text-indigo-600 focus:outline-none">
        {checked ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><TabletSmartphone className="w-6 h-6 text-indigo-600"/> Operational Rules</h1>
        <p className="text-gray-500 font-bold mt-1">Configure POS modules, KOT routing, and staff permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
          {/* Order Types */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-black text-gray-900 border-b pb-2">Enabled Order Modules</h3>
            <div className="space-y-3">
              <Toggle label="Dine-In (Tables)" checked={formData.dineInEnabled} onChange={(v:boolean) => setFormData({...formData, dineInEnabled: v})} />
              <Toggle label="Takeaway / Pickup" checked={formData.takeawayEnabled} onChange={(v:boolean) => setFormData({...formData, takeawayEnabled: v})} />
              <Toggle label="Delivery" checked={formData.deliveryEnabled} onChange={(v:boolean) => setFormData({...formData, deliveryEnabled: v})} />
              <Toggle label="QR Self-Ordering" checked={formData.qrOrderEnabled} onChange={(v:boolean) => setFormData({...formData, qrOrderEnabled: v})} />
            </div>
          </div>

          {/* Kitchen & KOT */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-black text-gray-900 border-b pb-2">Kitchen Display & KOT</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">KOT Ticket Prefix</label>
                <input type="text" value={formData.kotPrefix} onChange={e => setFormData({...formData, kotPrefix: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <Toggle label="Auto-Print KOT to Kitchen" checked={formData.autoPrintKot} onChange={(v:boolean) => setFormData({...formData, autoPrintKot: v})} />
              <Toggle label="Station Routing (Bar vs Kitchen)" checked={formData.kitchenRouting} onChange={(v:boolean) => setFormData({...formData, kitchenRouting: v})} />
            </div>
          </div>

          {/* Controls & Security */}
          <div className="col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-black text-gray-900 border-b pb-2">Inventory & Discounts</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Max Cashier Discount (%)</label>
                <input type="number" min="0" max="100" value={formData.maxCashierDiscount} onChange={e => setFormData({...formData, maxCashierDiscount: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-rose-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Max Manager Discount (%)</label>
                <input type="number" min="0" max="100" value={formData.maxManagerDiscount} onChange={e => setFormData({...formData, maxManagerDiscount: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-rose-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Table Name Prefix</label>
                <input type="text" value={formData.tablePrefix} onChange={e => setFormData({...formData, tablePrefix: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. T or Table" />
              </div>
              <div className="col-span-3">
                <Toggle label="Allow Negative Inventory Stock (Sell when out of stock)" checked={formData.allowNegativeStock} onChange={(v:boolean) => setFormData({...formData, allowNegativeStock: v})} />
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
