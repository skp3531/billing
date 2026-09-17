import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart3, PieChart, Users, Package, 
  TrendingUp, Activity, FileText, Calendar, Wallet, Layers, ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

export default function ReportsLayout() {
  const [dateRange, setDateRange] = useState('TODAY');
  
  const menuGroups = [
    {
      title: 'Executive',
      items: [
        { id: 'dashboard', label: 'CEO Dashboard', path: '/reports/dashboard', icon: Activity },
        { id: 'sales', label: 'Sales Command Center', path: '/reports/sales', icon: TrendingUp },
      ]
    },
    {
      title: 'Menu & Inventory',
      items: [
        { id: 'menu', label: 'Menu Engineering', path: '/reports/products', icon: PieChart },
        { id: 'inventory', label: 'Food Cost & Supply', path: '/reports/inventory', icon: Package },
      ]
    },
    {
      title: 'Customers & Loyalty',
      items: [
        { id: 'customers', label: 'Customer Intelligence', path: '/reports/customers', icon: Users },
      ]
    },
    {
      title: 'Operations & Finance',
      items: [
        { id: 'pnl', label: 'Profitability (PNL)', path: '/reports/pnl', icon: Wallet },
        { id: 'cash', label: 'Cash Register Analytics', path: '/reports/cash', icon: Layers },
      ]
    },
    {
      title: 'Compliance',
      items: [
        { id: 'gst', label: 'GST Control Center', path: '/reports/gst', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      
      {/* Dark Premium Sidebar */}
      <div className="w-72 bg-[#0B1220] border-r border-[#1e293b] overflow-y-auto text-slate-300">
        <div className="p-6 pb-4 border-b border-[#1e293b]">
          <h2 className="text-xl font-black text-amber-500 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> BI Center
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">Enterprise Analytics Engine</p>
        </div>

        <div className="p-4 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-3">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                      isActive 
                        ? "bg-amber-500/10 text-amber-500" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Sticky Filter Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-bold text-gray-700 text-sm">Date Range:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'THIS_MONTH'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={clsx(
                  "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                  dateRange === range 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {range.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Views */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <Outlet context={{ dateRange }} />
        </div>
        
      </div>
    </div>
  );
}
