import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SetupWizard from './pages/setup/SetupWizard';
import DashboardPage from './pages/dashboard/DashboardPage';
import ComingSoonPage from './pages/ComingSoonPage';
import UsersPage from './pages/users/UsersPage';
import OutletsPage from './pages/outlets/OutletsPage';
import RolesPage from './pages/roles/RolesPage';
import SettingsPage from './pages/settings/SettingsPage';
import ReportsPage from './pages/reports/ReportsPage';
import UnauthorizedPage from './pages/errors/UnauthorizedPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import AppLayout from './components/layout/AppLayout';
import MenuPage from './pages/menu/MenuPage';
import ProtectedRoute from './components/guards/ProtectedRoute';
import ModuleGuard from './components/guards/ModuleGuard';
import PermissionGuard from './components/guards/PermissionGuard';
import POSPage from './pages/pos/POSPage';
import OrdersPage from './pages/orders/OrdersPage';
import TablesPage from './pages/tables/TablesPage';
import KitchenPage from './pages/kitchen/KitchenPage';
import CustomersPage from './pages/customers/CustomersPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import PurchasesPage from './pages/purchases/PurchasesPage';

import { useEffect, useState } from 'react';
import api from './api/axios';
import { useAuthStore } from './store/authStore';
import axios from 'axios';

const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setAccessToken, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;
        setAccessToken(accessToken);
      } catch (err) {
        logout();
      } finally {
        setIsInitializing(false);
      }
    };
    
    initAuth();
  }, []);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-amber-600 font-bold">Loading...</div>;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthInit>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="setup" element={<SetupWizard />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="tables" element={<ModuleGuard module="tables"><TablesPage /></ModuleGuard>} />
          <Route path="kitchen" element={<ModuleGuard module="kitchen"><KitchenPage /></ModuleGuard>} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="inventory" element={<PermissionGuard permission="inventory.view"><InventoryPage /></PermissionGuard>} />
          <Route path="purchases" element={<PermissionGuard permission="purchases.view"><PurchasesPage /></PermissionGuard>} />
          <Route path="suppliers" element={<PermissionGuard permission="suppliers.view"><SuppliersPage /></PermissionGuard>} />
          <Route path="customers" element={<PermissionGuard permission="customers.view"><CustomersPage /></PermissionGuard>} />
          <Route path="staff" element={<PermissionGuard permission="staff.view"><UsersPage /></PermissionGuard>} />
          <Route path="expenses" element={<PermissionGuard permission="expenses.view"><ExpensesPage /></PermissionGuard>} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/outlets" element={<OutletsPage />} />
          <Route path="settings/roles" element={<RolesPage />} />
        </Route>
        
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
          </AuthInit>
    </BrowserRouter>
  );
}

export default App;
