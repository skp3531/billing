import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, Organization, Outlet, LoginResponse } from '../types';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  organization: Organization | null;
  outlets: Outlet[];
  currentOutlet: Outlet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (data: LoginResponse) => void;
  setCurrentOutlet: (outlet: Outlet) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      organization: null,
      outlets: [],
      currentOutlet: null,
      isAuthenticated: false,
      isLoading: true,
      
      setAuth: (data) => set({
        accessToken: data.accessToken,
        user: data.user,
        organization: data.organization,
        outlets: data.outlets,
        currentOutlet: data.currentOutlet,
        isAuthenticated: true,
        isLoading: false,
      }),
      
      setCurrentOutlet: (outlet) => set({ currentOutlet: outlet }),
      setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),
      logout: () => set({ 
        accessToken: null, 
        user: null, 
        organization: null, 
        outlets: [], 
        currentOutlet: null, 
        isAuthenticated: false,
        isLoading: false
      }),
      hasPermission: (permission) => {
        const user = get().user;
        return user?.permissions?.includes(permission) ?? false;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        organization: state.organization,
        outlets: state.outlets,
        currentOutlet: state.currentOutlet
      }) // Do not persist accessToken
    }
  )
);
