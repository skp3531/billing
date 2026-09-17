import IntegrationsTab from './IntegrationsTab';
import SystemTab from './SystemTab';
import LegalTab from './LegalTab';
import React, { useState, useEffect } from 'react';
import { Settings, Building2, MapPin, Store, Clock, Users, ShieldAlert, BadgeIndianRupee, ReceiptText, Printer, TabletSmartphone, Server, Bell, Key, Zap, CheckCircle, Database } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import BillingTab from './BillingTab';
import OperationsTab from './OperationsTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/organizations/command-center');
      setData(res.data.data);
    } catch {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const menuGroups = [
    {
      title: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Zap },
        { id: 'organization', label: 'Organization Profile', icon: Building2 },
        { id: 'outlets', label: 'Outlet Management', icon: Store },
        { id: 'legal', label: 'Legal & Compliance', icon: ShieldAlert },
      ]
    },
    {
      title: 'Operations & Billing',
      items: [
        { id: 'billing', label: 'Billing & Invoicing', icon: ReceiptText },
        { id: 'taxes', label: 'Tax Configuration', icon: BadgeIndianRupee },
        { id: 'printing', label: 'Print Settings', icon: Printer },
        { id: 'modules', label: 'Module Rules (KOT, QR)', icon: TabletSmartphone },
      ]
    },
    {
      title: 'Access & Security',
      items: [
        { id: 'users', label: 'Users & Roles (RBAC)', icon: Users },
        { id: 'shifts', label: 'Shift Management', icon: Clock },
        { id: 'integrations', label: 'API Integrations', icon: Key },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'system', label: 'System & Backups', icon: Database },
      ]
    }
  ];

  const KPICard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={clsx("p-3 rounded-xl shrink-0", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        <p className="text-xs font-bold text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      
      {/* Settings Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 pb-2">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-600" /> Control Center</h2>
          <p className="text-xs font-bold text-gray-500 mt-1">Manage all restaurant systems</p>
        </div>

        <div className="p-4 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-3">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                      activeTab === item.id 
                        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="text-center p-12 font-bold text-gray-500">Loading Configuration...</div>
        ) : !data ? (
          <div className="text-center p-12 font-bold text-rose-500">Error loading configuration. Please refresh.</div>
        ) : (
          <div className="max-w-5xl space-y-8">
            
            {activeTab === 'dashboard' && (
              <>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">System Dashboard</h1>
                  <p className="text-gray-500 font-bold mt-1">Overview of your enterprise configuration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <KPICard title="Total Outlets" value={data.kpis.totalOutlets} subtitle="Active franchised locations" icon={Store} colorClass="bg-blue-50 text-blue-600" />
                  <KPICard title="Active Users" value={data.kpis.activeUsers} subtitle="Staff across all outlets" icon={Users} colorClass="bg-indigo-50 text-indigo-600" />
                  <KPICard title="API Integrations" value={data.kpis.activeIntegrations} subtitle="Zomato, Swiggy, Razorpay" icon={Key} colorClass="bg-amber-50 text-amber-600" />
                  <KPICard title="Tax Profiles" value={data.kpis.activeTaxProfiles} subtitle="Active GST Brackets mapped" icon={BadgeIndianRupee} colorClass="bg-rose-50 text-rose-600" />
                  <KPICard title="Subscription" value={data.org.subscriptionPlan.replace('_', ' ')} subtitle={data.org.subscriptionExpiry ? `Expires: ${new Date(data.org.subscriptionExpiry).toLocaleDateString()}` : "Active"} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600" />
                  <KPICard title="System Backup" value={data.org.lastBackupDate ? new Date(data.org.lastBackupDate).toLocaleDateString() : 'Never'} subtitle="Last successful sync" icon={Server} colorClass="bg-gray-100 text-gray-700" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-black text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm text-left transition-colors">Start Day Open</button>
                      <button className="p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm text-left transition-colors">Setup New Printer</button>
                      <button className="p-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-sm text-left transition-colors">Cash Closing Report</button>
                      <button className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm text-left transition-colors flex items-center justify-between">Trigger Backup <Database className="w-4 h-4"/></button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 rounded-2xl border border-indigo-700 shadow-sm text-white">
                    <h3 className="font-black flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-amber-400" /> AI Settings Assistant</h3>
                    <div className="space-y-3">
                      {!data.org.integrations?.razorpayKey && (
                        <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <p className="text-sm font-bold">Online payments are disabled.</p>
                            <p className="text-xs text-indigo-200 mt-0.5">Map your Razorpay keys in API Integrations to accept QR payments.</p>
                          </div>
                        </div>
                      )}
                      {!data.org.lastBackupDate && (
                        <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-start gap-3">
                          <Database className="w-5 h-5 text-rose-400 shrink-0" />
                          <div>
                            <p className="text-sm font-bold">System Backup not configured.</p>
                            <p className="text-xs text-indigo-200 mt-0.5">Go to System & Backups to schedule automatic daily database backups.</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-sm font-bold">GST Configuration is fully compliant.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'billing' && <BillingTab org={data.org} onUpdate={fetchData} />}
            {activeTab === 'modules' && <OperationsTab org={data.org} onUpdate={fetchData} />}
            {activeTab === 'legal' && <LegalTab org={data.org} onUpdate={fetchData} />}
            {activeTab === 'integrations' && <IntegrationsTab org={data.org} onUpdate={fetchData} />}
            {activeTab === 'system' && <SystemTab org={data.org} onUpdate={fetchData} />}

            {activeTab !== 'dashboard' && activeTab !== 'billing' && activeTab !== 'modules' && activeTab !== 'legal' && activeTab !== 'integrations' && activeTab !== 'system' && (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-black text-gray-900">Module Configuration</h2>
                <p className="text-gray-500 font-bold mt-2">This configuration panel ({activeTab}) will be unlocked in the upcoming implementation phases.</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
