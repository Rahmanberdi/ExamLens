import { create } from 'zustand';
import i18n from '../i18n';

type Lang = 'en' | 'zh' | 'ru';

interface LangStore {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const stored = (localStorage.getItem('lang') as Lang) || 'en';

export const useLangStore = create<LangStore>((set) => ({
  lang: stored,
  setLang: (l) => {
    localStorage.setItem('lang', l);
    i18n.changeLanguage(l);
    set({ lang: l });
  },
}));
