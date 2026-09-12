import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ModuleGuardProps {
  children: React.ReactNode;
  module: 'tables' | 'kitchen';
}

const ModuleGuard: React.FC<ModuleGuardProps> = ({ children, module }) => {
  const { organization } = useAuthStore();
  const isEnabled = organization?.modulesEnabled?.[module] !== false;

  if (!isEnabled) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ModuleGuard;
