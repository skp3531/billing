import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import { 
  HomeIcon, ShoppingCartIcon, ClipboardDocumentListIcon, RectangleGroupIcon, 
  FireIcon, BookOpenIcon, ArchiveBoxIcon, TruckIcon, BuildingStorefrontIcon, 
  UsersIcon, UserGroupIcon, CreditCardIcon, ChartBarIcon, CogIcon, XMarkIcon 
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, permission: 'dashboard.view' },
  { name: 'POS', path: '/pos', icon: ShoppingCartIcon, permission: 'pos.view' },
  { name: 'Orders', path: '/orders', icon: ClipboardDocumentListIcon, permission: 'orders.view' },
  { name: 'Tables', path: '/tables', icon: RectangleGroupIcon, permission: 'pos.view' },
  { name: 'Kitchen', path: '/kitchen', icon: FireIcon, permission: 'kitchen.view' },
  { name: 'Menu', path: '/menu', icon: BookOpenIcon, permission: 'menu.view' },
  { name: 'Inventory', path: '/inventory', icon: ArchiveBoxIcon, permission: 'inventory.view' },
  { name: 'Purchases', path: '/purchases', icon: TruckIcon, permission: 'purchases.view' },
  { name: 'Suppliers', path: '/suppliers', icon: BuildingStorefrontIcon, permission: 'suppliers.view' },
  { name: 'Customers', path: '/customers', icon: UsersIcon, permission: 'customers.view' },
  { name: 'Staff', path: '/staff', icon: UserGroupIcon, permission: 'staff.view' },
  { name: 'Expenses', path: '/expenses', icon: CreditCardIcon, permission: 'expenses.view' },
  { name: 'Reports', path: '/reports', icon: ChartBarIcon, permission: 'reports.view' },
  { name: 'Settings', path: '/settings', icon: CogIcon, permission: 'settings.view' },
];

const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { user, organization, hasPermission } = useAuthStore();

  const isTablesEnabled = organization?.modulesEnabled?.tables !== false;
  const isKitchenEnabled = organization?.modulesEnabled?.kitchen !== false;

  const visibleNavItems = navItems.filter(item => {
    if (item.name === 'Tables' && !isTablesEnabled) return false;
    if (item.name === 'Kitchen' && !isKitchenEnabled) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  return (
      {/* Sidebar Aside */}
      <aside className={clsx(
        "bg-gray-900 text-white transition-all duration-300 z-50",
        // Hidden on mobile, only flex on desktop
        "hidden md:flex md:flex-col md:static shrink-0",
        sidebarCollapsed ? "md:w-16" : "w-64"
      )}>
        {/* Header with Logo & Close Button for Mobile */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <BuildingStorefrontIcon className="h-8 w-8 text-amber-500 shrink-0" />
            {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
              <span className="text-xl font-bold tracking-tight">RestoPOS</span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2">
            {visibleNavItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) => clsx(
                    "flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all",
                    isActive 
                      ? "bg-amber-600 text-white shadow-md font-semibold" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white",
                    sidebarCollapsed ? "md:justify-center" : "justify-start"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User profile footer */}
        <div className="p-3 border-t border-gray-800 flex items-center">
          <div className="h-9 w-9 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
            <div className="ml-3 truncate min-w-0">
              <p className="text-sm font-semibold truncate text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.roleName || 'Staff'}</p>
            </div>
          )}
        </div>
      </aside>
  );
};

export default Sidebar;
