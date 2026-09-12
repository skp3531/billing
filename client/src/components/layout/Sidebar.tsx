import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import { 
  HomeIcon, ShoppingCartIcon, ClipboardDocumentListIcon, RectangleGroupIcon, 
  FireIcon, BookOpenIcon, ArchiveBoxIcon, TruckIcon, BuildingStorefrontIcon, 
  UsersIcon, UserGroupIcon, CreditCardIcon, ChartBarIcon, CogIcon 
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'POS', path: '/pos', icon: ShoppingCartIcon },
  { name: 'Orders', path: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Tables', path: '/tables', icon: RectangleGroupIcon },
  { name: 'Kitchen', path: '/kitchen', icon: FireIcon },
  { name: 'Menu', path: '/menu', icon: BookOpenIcon },
  { name: 'Inventory', path: '/inventory', icon: ArchiveBoxIcon },
  { name: 'Purchases', path: '/purchases', icon: TruckIcon },
  { name: 'Suppliers', path: '/suppliers', icon: BuildingStorefrontIcon },
  { name: 'Customers', path: '/customers', icon: UsersIcon },
  { name: 'Staff', path: '/staff', icon: UserGroupIcon },
  { name: 'Expenses', path: '/expenses', icon: CreditCardIcon },
  { name: 'Reports', path: '/reports', icon: ChartBarIcon },
  { name: 'Settings', path: '/settings', icon: CogIcon },
];

const Sidebar = () => {
  const { sidebarCollapsed } = useAppStore();
  const { user, organization } = useAuthStore();

  
  const isTablesEnabled = organization?.modulesEnabled?.tables !== false;
  const isKitchenEnabled = organization?.modulesEnabled?.kitchen !== false;

  const visibleNavItems = navItems.filter(item => {
    if (item.name === 'Tables' && !isTablesEnabled) return false;
    if (item.name === 'Kitchen' && !isKitchenEnabled) return false;
    return true;
  });

  return (
    <aside className={clsx(
      "bg-gray-900 text-white flex flex-col transition-all duration-300",
      sidebarCollapsed ? "w-0 overflow-hidden md:w-16" : "w-64"
    )}>
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <BuildingStorefrontIcon className="h-8 w-8 text-amber-500" />
        {!sidebarCollapsed && <span className="ml-2 text-xl font-bold">RestoPOS</span>}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {visibleNavItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center px-2 py-2 rounded-md group transition-colors",
                  isActive ? "bg-amber-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                  sidebarCollapsed ? "justify-center" : "justify-start"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-6 w-6 shrink-0" />
                {!sidebarCollapsed && <span className="ml-3 truncate">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800 flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
          <span className="text-sm font-medium">{user?.name?.charAt(0) || 'U'}</span>
        </div>
        {!sidebarCollapsed && (
          <div className="ml-3 truncate">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.roleName}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
