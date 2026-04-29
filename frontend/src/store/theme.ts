import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const stored = (localStorage.getItem('theme') as Theme) || 'light';
document.documentElement.setAttribute('data-theme', stored);

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: stored,
  setTheme: (t) => {
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
    set({ theme: t });
  },
  toggle: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),
}));
