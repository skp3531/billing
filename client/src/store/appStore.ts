import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  setLoading: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setLoading: (v) => set({ isLoading: v }),
}));
