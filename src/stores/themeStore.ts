import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const initialState: Partial<ThemeState> = {
  darkMode: false
};

export const useThemeStore = create(
  persist<ThemeState>(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'pos-theme-storage',
      version: 1,
      migrate: (persistedState: any) => ({
        ...initialState,
        ...persistedState,
      })
    }
  )
);