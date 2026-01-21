import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

interface OrganizationState {
  currentOrganizationId: string | null;
  setCurrentOrganizationId: (id: string | null) => void;
}

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;
}

interface AppState extends SidebarState, OrganizationState, WorkspaceState {}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar state
      isCollapsed: false,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

      // Organization state
      currentOrganizationId: null,
      setCurrentOrganizationId: (id) => set({ currentOrganizationId: id }),

      // Workspace state
      currentWorkspaceId: null,
      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
    }),
    {
      name: "atlvs-app-store",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        currentOrganizationId: state.currentOrganizationId,
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
);

// Selector hooks for better performance
export const useSidebarCollapsed = () => useAppStore((state) => state.isCollapsed);
export const useToggleSidebar = () => useAppStore((state) => state.toggleCollapsed);
export const useCurrentOrganizationId = () => useAppStore((state) => state.currentOrganizationId);
export const useCurrentWorkspaceId = () => useAppStore((state) => state.currentWorkspaceId);
