import React, { useState } from 'react';
import { Key, Save, Lock } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function IntegrationsTab({ org, onUpdate }: any) {
  const [formData, setFormData] = useState({
    razorpayKey: org.integrations?.razorpayKey || '',
    razorpaySecret: org.integrations?.razorpaySecret || '',
    zomatoId: org.integrations?.zomatoId || '',
    swiggyId: org.integrations?.swiggyId || ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/organization/me', { integrations: formData });
      toast.success('API Keys securely updated');
      onUpdate();
    } catch {
      toast.error('Failed to update integrations');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Key className="w-6 h-6 text-indigo-600"/> API Integration Vault</h1>
        <p className="text-gray-500 font-bold mt-1">Manage secure keys for Payment Gateways and Delivery Aggregators</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">Razorpay Payment Gateway</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Key ID</label>
              <input type="text" value={formData.razorpayKey} onChange={e => setFormData({...formData, razorpayKey: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="rzp_live_..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Key Secret</label>
              <div className="relative">
                <input type="password" value={formData.razorpaySecret} onChange={e => setFormData({...formData, razorpaySecret: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••••••••••" />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">Food Aggregators (POS Sync)</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Zomato Restaurant ID</label>
              <input type="text" value={formData.zomatoId} onChange={e => setFormData({...formData, zomatoId: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Swiggy Restaurant ID</label>
              <input type="text" value={formData.swiggyId} onChange={e => setFormData({...formData, swiggyId: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Save className="w-5 h-5"/> {saving ? 'Saving...' : 'Save Keys'}
        </button>
      </form>
    </div>
  );
}
