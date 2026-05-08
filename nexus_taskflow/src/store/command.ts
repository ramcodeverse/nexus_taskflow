import { create } from 'zustand';

interface CommandState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
