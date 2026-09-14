const fs = require('fs');
let content = fs.readFileSync('client/src/components/layout/BottomNav.tsx', 'utf8');

const newContent = `import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCartIcon, ClipboardDocumentListIcon, BookOpenIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { name: 'POS', path: '/pos', icon: ShoppingCartIcon, permission: 'pos.view' },
  { name: 'Orders', path: '/orders', icon: ClipboardDocumentListIcon, permission: 'orders.view' },
  { name: 'Menu', path: '/menu', icon: BookOpenIcon, permission: 'menu.view' },
  { name: 'Report', path: '/reports', icon: ChartBarIcon, permission: 'reports.view' },
  { name: 'Setting', path: '/settings', icon: CogIcon, permission: 'settings.view' },
];

const BottomNav = () => {
  const { hasPermission } = useAuthStore();
  
  const visibleItems = navItems.filter(item => !item.permission || hasPermission(item.permission));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] pb-safe">
      <div className="flex justify-around items-center h-16">
        {visibleItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              \`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors \${
                isActive ? 'text-amber-600' : 'text-gray-500 hover:text-gray-900'
              }\`
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
`;
fs.writeFileSync('client/src/components/layout/BottomNav.tsx', newContent);
