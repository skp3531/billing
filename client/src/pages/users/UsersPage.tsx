import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Users, Briefcase, BadgeIndianRupee, Phone, CalendarDays, Key, MapPin } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    outletIds: [] as string[],
    department: 'FRONT_OF_HOUSE',
    designation: '',
    payrollType: 'SALARY',
    baseSalary: 0,
    hourlyRate: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, r, o] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/outlets'),
      ]);
      setUsers(u.data.data);
      setRoles(r.data.data);
      setOutlets(o.data.data);
    } catch {
      toast.error('Failed to load HR data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (user: any) => {
    if (typeof user.roleId === 'object' && user.roleId.name) return user.roleId.name;
    const role = roles.find(r => r._id === user.roleId);
    return role ? role.name : 'Unknown Role';
  };

  const openNew = () => {
    setForm({ name: '', email: '', phone: '', password: '', roleId: '', outletIds: [], department: 'FRONT_OF_HOUSE', designation: '', payrollType: 'SALARY', baseSalary: 0, hourlyRate: 0 });
    setEditingId('');
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      password: '',
      roleId: typeof u.roleId === 'object' ? u.roleId._id : u.roleId,
      outletIds: u.outletIds.map((o: any) => typeof o === 'object' ? o._id : o) || [],
      department: u.department || 'FRONT_OF_HOUSE',
      designation: u.designation || '',
      payrollType: u.payrollType || 'SALARY',
      baseSalary: u.baseSalary || 0,
      hourlyRate: u.hourlyRate || 0,
    });
    setEditingId(u._id);
    setShowModal(true);
  };

  const toggleOutlet = (id: string) => {
    setForm(f => ({
      ...f,
      outletIds: f.outletIds.includes(id) ? f.outletIds.filter(x => x !== id) : [...f.outletIds, id]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete (payload as any).password;
        await api.put(`/users/${editingId}`, payload);
        toast.success('Staff profile updated');
      } else {
        await api.post('/users', form);
        toast.success('Staff member onboarded');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save staff data');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this employee? They will lose POS access.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Employee deactivated');
      fetchData();
    } catch {
      toast.error('Failed to deactivate employee');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 flex-col">
      <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Briefcase className="w-6 h-6 text-indigo-600" /> HR & Staff Directory</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm">Manage employee profiles, payroll details, and POS access</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-colors">
          <PlusIcon className="w-5 h-5"/> Onboard Staff
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="text-center font-bold text-gray-400 mt-20">Loading HR Database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(u => (
              <div key={u._id} className={clsx("bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-all group", !u.active ? "border-gray-200 opacity-60" : "border-indigo-100 hover:border-indigo-300")}>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shadow-sm border border-indigo-200">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                        {u.name}
                        {u._id === currentUser?._id && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black uppercase">You</span>}
                      </h3>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{u.designation || 'Staff'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><Key className="w-3 h-3 text-gray-500"/></div>
                    <span className="flex-1">Role: {getRoleName(u)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><MapPin className="w-3 h-3 text-gray-500"/></div>
                    <span className="flex-1">Dept: {u.department?.replace(/_/g, ' ') || 'FRONT OF HOUSE'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><Phone className="w-3 h-3 text-gray-500"/></div>
                    <span className="flex-1">{u.phone || 'No Phone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center"><BadgeIndianRupee className="w-3 h-3 text-indigo-500"/></div>
                    <span className="flex-1 text-indigo-700">
                      {u.payrollType === 'HOURLY' ? `₹${u.hourlyRate}/hr` : `₹${u.baseSalary?.toLocaleString()}/mo`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  {u.active ? <span className="text-xs font-black text-emerald-600 uppercase flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> Active</span> : <span className="text-xs font-black text-rose-600 uppercase flex items-center gap-1"><XCircleIcon className="w-4 h-4"/> Suspended</span>}
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(u)} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm"><PencilIcon className="w-4 h-4"/></button>
                    {u._id !== currentUser?._id && u.active && (
                      <button onClick={() => handleDeactivate(u._id)} className="text-rose-500 hover:text-rose-700 font-bold text-sm"><TrashIcon className="w-4 h-4"/></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HR Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                {editingId ? 'Update Employee Profile' : 'Onboard New Employee'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Access Password {editingId && '(Optional)'}</label>
                    <input required={!editingId} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">Employment & Payroll</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                    <select required value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="FRONT_OF_HOUSE">Front of House</option>
                      <option value="KITCHEN">Kitchen</option>
                      <option value="MANAGEMENT">Management</option>
                      <option value="BACK_OFFICE">Back Office</option>
                      <option value="DELIVERY">Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Designation</label>
                    <input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Head Chef" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payroll Type</label>
                    <select required value={form.payrollType} onChange={e => setForm({...form, payrollType: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="SALARY">Fixed Monthly Salary</option>
                      <option value="HOURLY">Hourly Wage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{form.payrollType === 'SALARY' ? 'Monthly Base Salary (₹)' : 'Hourly Rate (₹)'}</label>
                    <input type="number" value={form.payrollType === 'SALARY' ? form.baseSalary : form.hourlyRate} onChange={e => setForm({...form, [form.payrollType === 'SALARY' ? 'baseSalary' : 'hourlyRate']: Number(e.target.value)})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">System Permissions (RBAC)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Role</label>
                    <select required value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">Select a security role...</option>
                      {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Outlet Access Granted</label>
                    <div className="grid grid-cols-2 gap-3">
                      {outlets.map(o => (
                        <label key={o._id} className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors", form.outletIds.includes(o._id) ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-200 hover:bg-gray-50")}>
                          <input type="checkbox" checked={form.outletIds.includes(o._id)} onChange={() => toggleOutlet(o._id)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                          <div>
                            <span className="block text-sm font-bold text-gray-900 leading-none">{o.name}</span>
                            <span className="block text-[10px] font-bold text-gray-400 mt-0.5">{o.code}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white border-t border-gray-100 py-4 -mx-6 px-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update HR Record' : 'Onboard Employee'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
