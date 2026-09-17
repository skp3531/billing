import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import { 
  HomeIcon, ShoppingCartIcon, ClipboardDocumentListIcon, RectangleGroupIcon, 
  FireIcon, BookOpenIcon, ArchiveBoxIcon, TruckIcon, BuildingStorefrontIcon, 
  UsersIcon, UserGroupIcon, CreditCardIcon, ChartBarIcon, CogIcon, XMarkIcon, CalendarDaysIcon, BriefcaseIcon 
} from '@heroicons/react/24/outline';

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, permission: 'dashboard.view' },
  { name: 'POS', path: '/pos', icon: ShoppingCartIcon, permission: 'pos.view' },
  { name: 'Kitchen (KDS)', path: '/kitchen', icon: FireIcon, permission: 'orders.view' },
  { name: 'Orders', path: '/orders', icon: ClipboardDocumentListIcon, permission: 'orders.view' },
  { name: 'Tables', path: '/tables', icon: RectangleGroupIcon, permission: 'tables.view' },
  { name: 'Reservations', path: '/reservations', icon: CalendarDaysIcon, permission: 'tables.view' },
  { name: 'Menu', path: '/menu', icon: BookOpenIcon, permission: 'menu.view' },
  { name: 'Inventory', path: '/inventory', icon: ArchiveBoxIcon, permission: 'inventory.view' },
  { name: 'Purchases', path: '/purchases', icon: TruckIcon, permission: 'purchases.view' },
  { name: 'Suppliers', path: '/suppliers', icon: BuildingStorefrontIcon, permission: 'purchases.view' },
  { name: 'Expenses', path: '/expenses', icon: CreditCardIcon, permission: 'expenses.view' },
  { name: 'Customers', path: '/customers', icon: UsersIcon, permission: 'customers.view' },
  { name: 'Staff Directory', path: '/users', icon: UserGroupIcon, permission: 'staff.view' },
  { name: 'HR & Payroll', path: '/hr', icon: BriefcaseIcon, permission: 'staff.view' },
  { name: 'Reports', path: '/reports', icon: ChartBarIcon, permission: 'reports.view' },
  { name: 'Settings', path: '/settings', icon: CogIcon, permission: 'settings.view' }
];

export default function Sidebar() {
  const { sidebarCollapsed: isSidebarOpen, setSidebarCollapsed: setSidebarOpen } = useAppStore();
  const { hasPermission } = useAuthStore();

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-30 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:transform-none shadow-2xl flex flex-col h-full",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 bg-gray-950 shrink-0 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl leading-none tracking-tighter">S</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white">Sphere POS</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 custom-scrollbar">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold",
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-100 hover:border-gray-800 border border-transparent"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
