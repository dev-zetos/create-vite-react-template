// src/store/useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Get system preference
const getSystemPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true;
};

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,
      themeMode: 'dark' as ThemeMode,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      setThemeMode: (mode) => {
        let isDark: boolean;
        if (mode === 'system') {
          isDark = getSystemPreference();
        } else {
          isDark = mode === 'dark';
        }
        set({ themeMode: mode, isDarkMode: isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;
