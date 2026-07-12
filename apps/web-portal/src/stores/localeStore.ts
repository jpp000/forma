import { create } from 'zustand';

export type PortalLocale = 'pt-BR' | 'en';

type LocaleState = {
  locale: PortalLocale;
  setLocale: (locale: PortalLocale) => void;
};

const STORAGE_KEY = 'forma.portal.locale';

function readStoredLocale(): PortalLocale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'pt-BR') {
      return stored;
    }
  } catch {
    // ignore
  }
  return 'pt-BR';
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: typeof localStorage === 'undefined' ? 'pt-BR' : readStoredLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    set({ locale });
  },
}));

export function getActiveLocale(): PortalLocale {
  return useLocaleStore.getState().locale;
}
