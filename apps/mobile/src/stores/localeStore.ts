import { getLocales } from 'expo-localization';
import { create } from 'zustand';

export type Locale = 'pt-BR' | 'en';

function resolveDeviceLocale(): Locale {
  const tag = getLocales()[0]?.languageTag ?? 'pt-BR';
  if (tag.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'pt-BR';
}

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: resolveDeviceLocale(),
  setLocale: (locale) => set({ locale }),
}));

export function getActiveLocale(): Locale {
  return useLocaleStore.getState().locale;
}
