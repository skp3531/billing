import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { Organization } from '../../types';
import { BuildingOffice2Icon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import PrinterSettingsTab from './PrinterSettingsTab';

type Tab = 'organization' | 'outlets' | 'roles' | 'printers' | 'modules';

const SettingsPage = () => {
  const { organization: currentOrg, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('organization');
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', gstin: '',
    address: { street: '', city: '', state: '', pincode: '' },
  });
  const [modulesEnabled, setModulesEnabled] = useState({ tables: true, kitchen: true });
  const [printSize, setPrintSize] = useState<'58mm' | '80mm' | 'A4'>('80mm');
  const [savingModules, setSavingModules] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      setLoading(true);
      try {
        const res = await api.get('/organizations/me');
        const data = res.data.data as Organization;
        setOrg(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          gstin: data.gstin || '',
          address: data.address || { street: '', city: '', state: '', pincode: '' },
        });
        // Initialize modules from org settings if present
        const anyData = data as any;
        if (anyData.modulesEnabled) {
          setModulesEnabled({
            tables: anyData.modulesEnabled.tables ?? true,
            kitchen: anyData.modulesEnabled.kitchen ?? true,
          });
        }
        if (anyData.printSize) {
          setPrintSize(anyData.printSize);
        }
      } catch {
        toast.error('Failed to load organization');
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/organizations/me', form);
      const updated = res.data.data as Organization;
      setOrg(updated);
      // Update the auth store with new org info
      if (currentOrg) {
        const authStore = useAuthStore.getState();
        authStore.setAuth({
          accessToken: authStore.accessToken || '',
          user: authStore.user!,
          organization: updated,
          outlets: authStore.outlets,
          currentOutlet: authStore.currentOutlet!,
        });
      }
      toast.success('Organization updated successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModules = async () => {
    setSavingModules(true);
    try {
      const res = await api.put('/organizations/me', { modulesEnabled, printSize } as any);
      const updated = res.data.data;
      
      const authStore = useAuthStore.getState();
      authStore.setAuth({
        accessToken: authStore.accessToken || '',
        user: authStore.user!,
        organization: updated,
        outlets: authStore.outlets,
        currentOutlet: authStore.currentOutlet!,
      });
      
      toast.success('Module settings saved');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save module settings');
    } finally {
      setSavingModules(false);
    }
  };

  const setAddress = (field: string, value: string) =>
    setForm(f => ({ ...f, address: { ...f.address, [field]: value } }));

  const tabs: { id: Tab; label: string }[] = [
    { id: 'apps', label: 'All Apps' },
    { id: 'organization', label: 'Organization' },
    { id: 'outlets', label: 'Outlets' },
    { id: 'roles', label: 'Roles & Permissions' },
    { id: 'printers', label: 'Printers & Hardware' },
    { id: 'modules', label: 'Modules & Print' },
  ];

  const appLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BuildingOffice2Icon },
    { name: 'Orders', path: '/orders', icon: BuildingOffice2Icon },
    { name: 'Tables', path: '/tables', icon: BuildingOffice2Icon },
    { name: 'Kitchen', path: '/kitchen', icon: BuildingOffice2Icon },
    { name: 'Menu', path: '/menu', icon: BuildingOffice2Icon },
    { name: 'Inventory', path: '/inventory', icon: BuildingOffice2Icon },
    { name: 'Purchases', path: '/purchases', icon: BuildingOffice2Icon },
    { name: 'Suppliers', path: '/suppliers', icon: BuildingOffice2Icon },
    { name: 'Customers', path: '/customers', icon: BuildingOffice2Icon },
    { name: 'Staff', path: '/staff', icon: BuildingOffice2Icon },
    { name: 'Expenses', path: '/expenses', icon: BuildingOffice2Icon },
    { name: 'Reports', path: '/reports', icon: BuildingOffice2Icon },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings & Apps</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your restaurant or access all modules</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'apps' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {appLinks.map(app => (
            <Link key={app.name} to={app.path} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-500 transition-all group">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3 group-hover:bg-amber-100 transition-colors">
                <app.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-800">{app.name}</span>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'organization' && (
        <div className="max-w-2xl">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BuildingOffice2Icon className="w-5 h-5 text-amber-500" />
                  Restaurant Information
                </h2>
                <p className="text-sm text-gray-500 mt-1">Basic information about your restaurant</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Shake Sphere"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <PhoneIcon className="w-4 h-4 inline mr-1" />Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <EnvelopeIcon className="w-4 h-4 inline mr-1" />Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="contact@restaurant.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                  <input
                    value={form.gstin}
                    onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" /> Address
                </p>
                <input value={form.address.street} onChange={e => setAddress('street', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Street address" />
                <div className="grid grid-cols-3 gap-3">
                  <input value={form.address.city} onChange={e => setAddress('city', e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="City" />
                  <input value={form.address.state} onChange={e => setAddress('state', e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="State" />
                  <input value={form.address.pincode} onChange={e => setAddress('pincode', e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Pincode" maxLength={6} />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'outlets' && (
        <div>
          <p className="text-gray-600 mb-4">Manage your restaurant outlets and locations.</p>
          <Link
            to="/settings/outlets"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Manage Outlets →
          </Link>
        </div>
      )}

      {activeTab === 'printers' && (
        <PrinterSettingsTab />
      )}

      {activeTab === 'roles' && (
        <div>
          <p className="text-gray-600 mb-4">View roles and their permissions. Use this to understand what each staff role can access.</p>
          <Link
            to="/settings/roles"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View Roles & Permissions →
          </Link>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Feature Modules</h2>
              <p className="text-sm text-gray-500 mt-1">Enable or disable features for your restaurant</p>
            </div>

            <div className="space-y-4">
              {/* Tables Module Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Tables Module</p>
                  <p className="text-sm text-gray-500">Enable table management and dine-in tracking</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModulesEnabled(m => ({ ...m, tables: !m.tables }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${modulesEnabled.tables ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${modulesEnabled.tables ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Kitchen Module Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Kitchen Module</p>
                  <p className="text-sm text-gray-500">Enable kitchen display system (KDS) for order preparation</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModulesEnabled(m => ({ ...m, kitchen: !m.kitchen }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${modulesEnabled.kitchen ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${modulesEnabled.kitchen ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Print Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['58mm', '80mm', 'A4'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPrintSize(size)}
                    className={`p-3 rounded-lg border font-medium text-sm transition-colors ${
                      printSize === size
                        ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveModules}
                disabled={savingModules}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {savingModules ? 'Saving...' : 'Save Module Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
