import { getLocales } from 'expo-localization';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import en from './en';
import ptBR, { type TranslationKey } from './pt-BR';

export type Locale = 'pt-BR' | 'en';

const catalogs: Record<Locale, Record<TranslationKey, string>> = {
  'pt-BR': ptBR,
  en,
};

function resolveDeviceLocale(): Locale {
  const tag = getLocales()[0]?.languageTag ?? 'pt-BR';
  if (tag.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'pt-BR';
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveDeviceLocale);

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setActiveLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const catalog = catalogs[locale] ?? catalogs['pt-BR'];
      const template = catalog[key] ?? catalogs['pt-BR'][key] ?? key;
      return interpolate(template, params);
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useLocale must be used within I18nProvider');
  }
  return ctx;
}

export function useT() {
  return useLocale().t;
}

/** Standalone translator for non-React modules (API client). */
let activeLocale: Locale = 'pt-BR';

export function setActiveLocale(locale: Locale) {
  activeLocale = locale;
}

export function getActiveLocale(): Locale {
  return activeLocale;
}

export function t(
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const catalog = catalogs[activeLocale] ?? catalogs['pt-BR'];
  const template = catalog[key] ?? catalogs['pt-BR'][key] ?? key;
  return interpolate(template, params);
}

export type { TranslationKey };
