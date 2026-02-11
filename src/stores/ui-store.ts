import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: Record<string, unknown> | null;
}

interface UIState {
  modal: ModalState;
  openModal: (type: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleNotificationsPanel: () => void;

  quickAddTaskOpen: boolean;
  setQuickAddTaskOpen: (open: boolean) => void;
  toggleQuickAddTask: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Modal state
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  openModal: (type, data = {}) =>
    set({
      modal: {
        isOpen: true,
        type,
        data,
      },
    }),
  closeModal: () =>
    set({
      modal: {
        isOpen: false,
        type: null,
        data: null,
      },
    }),

  // Command palette state
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  // Notifications panel state
  notificationsPanelOpen: false,
  setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
  toggleNotificationsPanel: () =>
    set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),

  // Quick-add task dialog
  quickAddTaskOpen: false,
  setQuickAddTaskOpen: (open) => set({ quickAddTaskOpen: open }),
  toggleQuickAddTask: () =>
    set((state) => ({ quickAddTaskOpen: !state.quickAddTaskOpen })),
}));

// Selector hooks
export const useModal = () => useUIStore((state) => state.modal);
export const useOpenModal = () => useUIStore((state) => state.openModal);
export const useCloseModal = () => useUIStore((state) => state.closeModal);
export const useCommandPaletteOpen = () => useUIStore((state) => state.commandPaletteOpen);
export const useToggleCommandPalette = () => useUIStore((state) => state.toggleCommandPalette);
