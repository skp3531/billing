import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import OutletSelector from './OutletSelector';
import { Bars3Icon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded p-1"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <OutletSelector />
        
        <div className="flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
          <span className="text-sm text-gray-500 hidden sm:block">Online</span>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <BellIcon className="h-6 w-6" />
        </button>
        
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500" title="Logout">
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
