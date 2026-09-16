import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Users, Star, Gift, Crown, BadgeIndianRupee, Search, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../api/customer.api';
import clsx from 'clsx';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    reset({ name: '', phone: '', email: '', loyaltyPoints: 0, tier: 'BRONZE' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setEditingCustomer(customer);
    reset(customer);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, data);
        toast.success('CRM profile updated');
      } else {
        await createCustomer(data);
        toast.success('Customer added to CRM');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch {
      toast.error('Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this customer from the CRM?')) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const TierBadge = ({ tier }: { tier: string }) => {
    const config: any = {
      PLATINUM: { color: 'bg-slate-800 text-slate-100 border-slate-600', icon: Crown },
      GOLD: { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Star },
      SILVER: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Star },
      BRONZE: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Star },
    };
    const c = config[tier] || config.BRONZE;
    const Icon = c.icon;
    return (
      <span className={clsx("flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded border uppercase", c.color)}>
        <Icon className="w-3 h-3" /> {tier}
      </span>
    );
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 flex-col">
      <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" /> CRM & Loyalty Center</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm">Manage guest relationships, VIP tiers, and points</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-xl transition-colors"><Filter className="w-5 h-5" /></button>
          <button onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md">
            <PlusIcon className="w-5 h-5"/> New Guest
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="text-center font-bold text-gray-400 mt-20">Loading CRM Database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCustomers.map(customer => (
              <div key={customer._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg text-gray-900 line-clamp-1">{customer.name}</h3>
                    <p className="text-sm font-bold text-gray-500">{customer.phone || 'No phone'}</p>
                  </div>
                  <TierBadge tier={customer.tier} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><BadgeIndianRupee className="w-3 h-3"/> LTV</p>
                    <p className="font-black text-gray-900">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Gift className="w-3 h-3"/> Points</p>
                    <p className="font-black text-indigo-700">{customer.loyaltyPoints || 0}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-4">
                  <span>Visits: {customer.visitCount || 0}</span>
                  <span>Last: {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(customer)} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1"><PencilIcon className="w-4 h-4"/> Edit</button>
                  <button onClick={() => handleDelete(customer._id)} className="text-rose-500 hover:text-rose-700 font-bold text-sm flex items-center gap-1"><TrashIcon className="w-4 h-4"/> Delete</button>
                </div>
              </div>
            ))}
            
            {filteredCustomers.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900">No Customers Found</h3>
                <p className="text-gray-500 font-bold mt-2">Adjust your search or add a new guest.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CRM Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {editingCustomer ? 'Update Profile' : 'New CRM Record'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guest Name</label>
                  <input {...register('name', { required: true })} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. John Doe" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                  <input {...register('phone')} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+91..." />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                  <input type="email" {...register('email')} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="@" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loyalty Points</label>
                  <input type="number" {...register('loyaltyPoints', { valueAsNumber: true })} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">VIP Tier</label>
                  <select {...register('tier')} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
