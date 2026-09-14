import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { LockClosedIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { Role } from '../../types';
import { useAuthStore } from '../../store/authStore';

const ALL_PERMISSIONS = [
  { group: 'Dashboard', perms: ['dashboard.view'] },
  { group: 'POS', perms: ['pos.view', 'pos.create', 'pos.edit', 'pos.delete', 'pos.manage', 'pos.create_order', 'pos.cancel_order', 'pos.refund', 'pos.apply_discount'] },
  { group: 'Orders', perms: ['orders.view', 'orders.create', 'orders.edit', 'orders.delete', 'orders.manage'] },
  { group: 'Kitchen', perms: ['kitchen.view'] },
  { group: 'Menu', perms: ['menu.view', 'menu.create', 'menu.edit', 'menu.delete', 'menu.manage'] },
  { group: 'Inventory', perms: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage'] },
  { group: 'Purchases', perms: ['purchases.view', 'purchases.create', 'purchases.edit', 'purchases.delete', 'purchases.manage'] },
  { group: 'Suppliers', perms: ['suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete', 'suppliers.manage'] },
  { group: 'Customers', perms: ['customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.manage'] },
  { group: 'Loyalty', perms: ['loyalty.view', 'loyalty.create', 'loyalty.edit', 'loyalty.delete', 'loyalty.manage'] },
  { group: 'Discounts', perms: ['discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete', 'discounts.manage'] },
  { group: 'Expenses', perms: ['expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete', 'expenses.manage'] },
  { group: 'Cash', perms: ['cash.view', 'cash.create', 'cash.edit', 'cash.delete', 'cash.manage'] },
  { group: 'Staff', perms: ['staff.view', 'staff.create', 'staff.edit', 'staff.delete', 'staff.manage'] },
  { group: 'Reports', perms: ['reports.view', 'reports.export'] },
  { group: 'Settings', perms: ['settings.view', 'settings.create', 'settings.edit', 'settings.delete', 'settings.manage'] },
  { group: 'Roles', perms: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage'] },
  { group: 'Audit', perms: ['audit.view'] },
];

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { hasPermission } = useAuthStore();
  const canManage = hasPermission('roles.manage');
  const [saving, setSaving] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      setRoles(res.data.data || []);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleTogglePermission = async (roleId: string, permission: string) => {
    if (!canManage) return;

    const role = roles.find(r => r._id === roleId);
    if (!role) return;

    const newPermissions = role.permissions.includes(permission)
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    // Optimistically update UI
    setRoles(roles.map(r => r._id === roleId ? { ...r, permissions: newPermissions } : r));

    setSaving(roleId);
    try {
      await api.put(`/roles/${roleId}`, { permissions: newPermissions });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
      // Revert on error
      fetchRoles();
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage roles and their associated permissions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map(role => (
            <div key={role._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleExpand(role._id)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {role.isSystem && <LockClosedIcon className="w-4 h-4 text-gray-400" />}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {role.name}
                      {saving === role._id && <span className="text-xs text-amber-500 animate-pulse">Saving...</span>}
                    </h3>
                    <p className="text-sm text-gray-500">{role.permissions.length} permissions</p>
                  </div>
                  {role.isSystem && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">System Role</span>
                  )}
                </div>
                {expandedId === role._id
                  ? <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  : <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                }
              </button>

              {expandedId === role._id && (
                <div className="border-t border-gray-100 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ALL_PERMISSIONS.map(({ group, perms }) => {
                      if (!canManage) {
                        const granted = perms.filter(p => role.permissions.includes(p));
                        if (granted.length === 0) return null;
                      }

                      return (
                        <div key={group} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{group}</h4>
                          <div className="space-y-1">
                            {perms.map(p => {
                              const hasPerm = role.permissions.includes(p);
                              return (
                                <div 
                                  key={p} 
                                  onClick={() => handleTogglePermission(role._id, p)}
                                  className={`flex items-center gap-2 p-1.5 rounded-md transition-colors ${canManage ? 'cursor-pointer hover:bg-white' : ''}`}
                                >
                                  {canManage ? (
                                    <div className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${hasPerm ? 'bg-green-500' : 'bg-gray-300'}`}>
                                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hasPerm ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                    </div>
                                  ) : (
                                    <div className={`w-2 h-2 rounded-full ${hasPerm ? 'bg-green-500' : 'bg-gray-200'}`} />
                                  )}
                                  <span className={`text-xs font-mono select-none ${hasPerm ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                    {p.split('.')[1]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesPage;
