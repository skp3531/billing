import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BuildingStorefrontIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

type Step = 1 | 2 | 3;

interface OrgForm {
  name: string;
  email: string;
  phone: string;
  gstin: string;
  address: { street: string; city: string; state: string; pincode: string };
}

interface OutletForm {
  name: string;
  code: string;
  invoicePrefix: string;
  phone: string;
}

const SetupWizard = () => {
  const navigate = useNavigate();
  const { setAuth, user, accessToken, outlets } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [orgForm, setOrgForm] = useState<OrgForm>({
    name: '', email: '', phone: '', gstin: '',
    address: { street: '', city: '', state: '', pincode: '' },
  });
  const [outletForm, setOutletForm] = useState<OutletForm>({
    name: 'Main Outlet', code: 'MAIN', invoicePrefix: '', phone: '',
  });

  const setAddress = (field: string, value: string) =>
    setOrgForm(f => ({ ...f, address: { ...f.address, [field]: value } }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await api.post('/organizations/setup', {
        organization: orgForm,
        outlet: outletForm,
      });
      const data = res.data.data;
      // Refresh auth data
      const meRes = await api.get('/auth/me');
      const meData = meRes.data.data;
      setAuth({
        accessToken: accessToken || '',
        user: meData.user || user!,
        organization: data.organization,
        outlets: data.outlets || [data.outlet],
        currentOutlet: data.outlet,
      });
      toast.success('Restaurant setup complete!');
      setStep(3);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Setup failed');
    } finally {
      setSaving(false);
    }
  };

  const stepLabels = ['Restaurant Info', 'First Outlet', 'Done'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <BuildingStorefrontIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to RestoPOS</h1>
          <p className="text-gray-500 mt-2">Let's set up your restaurant in a few quick steps</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {stepLabels.map((label, idx) => {
            const s = (idx + 1) as Step;
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center gap-2 ${s <= step ? 'text-amber-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step ? 'bg-amber-500 text-white' : s === step ? 'border-2 border-amber-500 text-amber-600' : 'border-2 border-gray-300 text-gray-400'
                  }`}>
                    {s < step ? '✓' : s}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 ${s < step ? 'bg-amber-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Restaurant Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                  <input
                    required
                    value={orgForm.name}
                    onChange={e => setOrgForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Shake Sphere"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      value={orgForm.phone}
                      onChange={e => setOrgForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={orgForm.email}
                      onChange={e => setOrgForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="contact@restaurant.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN (optional)</label>
                  <input
                    value={orgForm.gstin}
                    onChange={e => setOrgForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    value={orgForm.address.city}
                    onChange={e => setAddress('city', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Bhubaneswar"
                  />
                </div>
              </div>
              <button
                disabled={!orgForm.name}
                onClick={() => setStep(2)}
                className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">First Outlet Setup</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outlet Name *</label>
                  <input
                    required
                    value={outletForm.name}
                    onChange={e => setOutletForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Main Outlet"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outlet Code *</label>
                    <input
                      required
                      value={outletForm.code}
                      onChange={e => setOutletForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      placeholder="MAIN"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-400 mt-1">Short identifier for this outlet</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix *</label>
                    <input
                      required
                      value={outletForm.invoicePrefix}
                      onChange={e => setOutletForm(f => ({ ...f, invoicePrefix: e.target.value.toUpperCase() }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      placeholder="SS"
                      maxLength={5}
                    />
                    <p className="text-xs text-gray-400 mt-1">Invoice numbers: SS-0001</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outlet Phone</label>
                  <input
                    value={outletForm.phone}
                    onChange={e => setOutletForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
                <button
                  disabled={!outletForm.name || !outletForm.code || !outletForm.invoicePrefix || saving}
                  onClick={handleSubmit}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-500 mb-6">
                <strong>{orgForm.name}</strong> has been configured with your first outlet.
                You can now start using RestoPOS.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
