import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCartIcon, ClipboardDocumentListIcon, BookOpenIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'POS', path: '/pos', icon: ShoppingCartIcon },
  { name: 'Orders', path: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Menu', path: '/menu', icon: BookOpenIcon },
  { name: 'Report', path: '/reports', icon: ChartBarIcon },
  { name: 'Setting', path: '/settings', icon: CogIcon },
];

const BottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-amber-600' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
