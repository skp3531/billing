import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { DateFilterProvider, useDateFilter, DateRangePreset } from '../../contexts/DateFilterContext';
import { 
  LayoutDashboard, TrendingUp, Package, Users, CreditCard, 
  Archive, ShoppingCart, UserCheck, Receipt, Tag, ArrowDownRight, 
  Banknote, Truck, Activity, Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const reportNavItems = [
  { name: 'Dashboard', path: '/reports/dashboard', icon: LayoutDashboard },
  { name: 'Sales Analytics', path: '/reports/sales', icon: TrendingUp },
  { name: 'Product Analytics', path: '/reports/products', icon: Package },
  { name: 'Customer Analytics', path: '/reports/customers', icon: Users },
  { name: 'Cash Register', path: '/reports/cash', icon: Banknote },
  { name: 'Inventory Consumption', path: '/reports/inventory', icon: Archive },
  { name: 'Profit & Loss', path: '/reports/pnl', icon: Activity },
  { name: 'Tax & GST Reports', path: '/reports/gst', icon: Receipt },
  { name: 'AI Insights', path: '/reports/insights', icon: Sparkles },
];

const DateSelector = () => {
  const { preset, setPreset, startDate, endDate } = useDateFilter();

  const presets: { label: string; value: DateRangePreset }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'This Month', value: 'this_month' },
    { label: 'This Year', value: 'this_year' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex space-x-2 overflow-x-auto w-full pb-1 sm:pb-0 hide-scrollbar">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              preset === p.value 
                ? "bg-amber-600 text-white shadow-sm" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-500 font-medium whitespace-nowrap px-4 border-l border-gray-200">
        {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
      </div>
    </div>
  );
};

const ReportsLayoutInner = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Reports Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
          <p className="text-xs text-gray-500">Business Intelligence</p>
        </div>
        <nav className="p-2 space-y-1">
          {reportNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-amber-50 text-amber-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={clsx("w-5 h-5 mr-3 flex-shrink-0", "text-amber-500")} />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <DateSelector />
        <Outlet />
      </div>
    </div>
  );
};

export const ReportsLayout = () => {
  return (
    <DateFilterProvider>
      <ReportsLayoutInner />
    </DateFilterProvider>
  );
};

export default ReportsLayout;
