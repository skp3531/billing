import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

const AppLayout = () => {
  const location = useLocation();
  const isPOS = location.pathname.startsWith('/pos');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative pb-16 md:pb-0">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar />
        <main className={`flex-1 min-w-0 ${isPOS ? 'p-0 overflow-hidden flex flex-col' : 'p-3 sm:p-6 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
