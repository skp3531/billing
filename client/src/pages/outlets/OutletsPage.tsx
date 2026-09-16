import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { Outlet } from '../../types';

interface OutletFormData {
  name: string;
  code: string;
  invoicePrefix: string;
  phone: string;
  gstin: string;
  taxRate: number;
  address: { street: string; city: string; state: string; pincode: string };
}

const defaultForm: OutletFormData = {
  name: '', code: '', invoicePrefix: '', phone: '', gstin: '', taxRate: 5,
  address: { street: '', city: '', state: '', pincode: '' },
};

const OutletsPage = () => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OutletFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/outlets');
      setOutlets(res.data.data || []);
    } catch {
      toast.error('Failed to load outlets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOutlets(); }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (o: Outlet) => {
    setForm({
      name: o.name, code: o.code, invoicePrefix: o.invoicePrefix,
      phone: o.phone || '', gstin: o.gstin || '', taxRate: o.taxRate || 5,
      address: o.address || defaultForm.address,
    });
    setEditingId(o._id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/outlets/${editingId}`, form);
        toast.success('Outlet updated');
      } else {
        await api.post('/outlets', form);
        toast.success('Outlet created');
      }
      setShowModal(false);
      fetchOutlets();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save outlet');
    } finally {
      setSaving(false);
    }
  };

  const setAddress = (field: string, value: string) =>
    setForm(f => ({ ...f, address: { ...f.address, [field]: value } }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outlets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your restaurant locations</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <PlusIcon className="w-5 h-5" /> Add Outlet
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-400">No outlets found. Add your first outlet.</div>
          ) : outlets.map(o => (
            <div key={o._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{o.name}</h3>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{o.code}</span>
                </div>
                <button onClick={() => openEdit(o)} className="p-1 text-gray-400 hover:text-amber-600">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {o.phone && <p>📞 {o.phone}</p>}
                {o.address?.city && <p>📍 {o.address.city}, {o.address.state}</p>}
                <p>🧾 Invoice Prefix: <span className="font-mono font-medium">{o.invoicePrefix}</span></p>
                {o.gstin && <p>GST: {o.gstin}</p>}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {o.active ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Outlet' : 'Add Outlet'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outlet Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Main Outlet" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" placeholder="MAIN" maxLength={10} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix *</label>
                  <input required value={form.invoicePrefix} onChange={e => setForm(f => ({ ...f, invoicePrefix: e.target.value.toUpperCase() }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" placeholder="SS" maxLength={5} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="+91 9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Address</p>
                <input value={form.address.street} onChange={e => setAddress('street', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Street address" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.address.city} onChange={e => setAddress('city', e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="City" />
                  <input value={form.address.state} onChange={e => setAddress('state', e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="State" />
                </div>
                <input value={form.address.pincode} onChange={e => setAddress('pincode', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Pincode" maxLength={6} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletsPage;
