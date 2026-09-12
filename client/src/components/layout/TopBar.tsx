import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import OutletSelector from './OutletSelector';
import { Bars3Icon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'POS Billing',
  '/orders': 'Orders',
  '/tables': 'Tables',
  '/kitchen': 'Kitchen KDS',
  '/menu': 'Menu',
  '/inventory': 'Inventory',
  '/purchases': 'Purchases',
  '/suppliers': 'Suppliers',
  '/customers': 'Customers',
  '/staff': 'Staff',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const TopBar = () => {
  const { logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine current page title
  const currentPath = '/' + location.pathname.split('/')[1];
  const pageTitle = routeTitles[currentPath] || 'RestoPOS';

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20">
      <div className="flex items-center min-w-0">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="ml-2 sm:ml-4 text-base sm:text-lg font-bold text-gray-800 truncate">
          {pageTitle}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        <OutletSelector />
        
        <div className="hidden sm:flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
          <span className="text-xs text-gray-500 font-medium">Online</span>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="text-gray-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" 
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
