import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const OutletSelector = () => {
  const { outlets, currentOutlet, setCurrentOutlet } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!outlets || outlets.length <= 1) {
    return (
      <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-md">
        {currentOutlet?.name || 'Default Outlet'}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      >
        <span>{currentOutlet?.name}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              {outlets.map((outlet) => (
                <button
                  key={outlet._id}
                  onClick={() => {
                    setCurrentOutlet(outlet);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  role="menuitem"
                >
                  <span>{outlet.name}</span>
                  {currentOutlet?._id === outlet._id && (
                    <CheckIcon className="h-4 w-4 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OutletSelector;
