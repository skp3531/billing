import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  BarChart3, FileText, Calendar, Wallet, ShieldCheck, Package
} from 'lucide-react';
import clsx from 'clsx';

export default function ReportsLayout() {
  const [dateRange, setDateRange] = useState('TODAY');
  
  const menuGroups = [
    {
      title: 'Daily Operations',
      items: [
        { id: 'dashboard', label: 'Daily Sales', path: '/reports/dashboard', icon: BarChart3 },
        { id: 'cash', label: 'End of Day (Z-Report)', path: '/reports/cash', icon: Wallet },
      ]
    },
    {
      title: 'Compliance & Cost',
      items: [
        { id: 'inventory', label: 'Inventory & Cost', path: '/reports/inventory', icon: Package },
        { id: 'gst', label: 'Tax & GST', path: '/reports/gst', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      
      {/* Standard Light Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Reports
          </h2>
          <p className="text-xs font-bold text-gray-500 mt-1">Restaurant Operations</p>
        </div>

        <div className="p-4 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-3">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        
        {/* Sticky Filter Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-bold text-gray-700 text-sm">Date Filter:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'THIS_MONTH'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-bold transition-all",
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
        <div className="flex-1 overflow-y-auto p-6 relative">
          <Outlet context={{ dateRange }} />
        </div>
        
      </div>
    </div>
  );
}
