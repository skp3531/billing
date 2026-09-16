import React, { useState } from 'react';
import { ShieldAlert, Save, FileText } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function LegalTab({ org, onUpdate }: any) {
  const [formData, setFormData] = useState({
    gstin: org.gstin || '',
    fssaiNumber: org.fssaiNumber || '',
    panNumber: org.panNumber || '',
    cinNumber: org.cinNumber || '',
    brandName: org.brandName || org.name,
    address: {
      street: org.address?.street || '',
      city: org.address?.city || '',
      state: org.address?.state || '',
      pincode: org.address?.pincode || '',
    }
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/organization/me', formData);
      toast.success('Legal profile updated');
      onUpdate();
    } catch {
      toast.error('Failed to update legal profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-indigo-600"/> Legal & Compliance</h1>
        <p className="text-gray-500 font-bold mt-1">Manage licenses, registrations, and official brand addresses</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2 flex items-center gap-2"><FileText className="w-5 h-5"/> Registration & Tax Identifiers</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">GSTIN Number</label>
              <input type="text" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase" placeholder="29ABCDE1234F1Z5" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">FSSAI License Number</label>
              <input type="text" value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Company PAN Number</label>
              <input type="text" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">CIN Number (Corporate)</label>
              <input type="text" value={formData.cinNumber} onChange={e => setFormData({...formData, cinNumber: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2">Headquarters / Registered Address</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
              <input type="text" value={formData.address.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
              <input type="text" value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
              <input type="text" value={formData.address.state} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
              <input type="text" value={formData.address.pincode} onChange={e => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Save className="w-5 h-5"/> {saving ? 'Saving...' : 'Save Legal Profile'}
        </button>
      </form>
    </div>
  );
}
