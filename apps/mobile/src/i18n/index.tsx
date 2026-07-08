import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  getActiveLocale,
  type Locale,
  useLocaleStore,
} from '../stores/localeStore';
import en from './en';
import ptBR, { type TranslationKey } from './pt-BR';

const catalogs: Record<Locale, Record<TranslationKey, string>> = {
  'pt-BR': ptBR,
  en,
};

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

function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const catalog = catalogs[locale] ?? catalogs['pt-BR'];
  const template = catalog[key] ?? catalogs['pt-BR'][key] ?? key;
  return interpolate(template, params);
}

export function useLocale() {
  const { locale, setLocale } = useLocaleStore(
    useShallow((state) => ({
      locale: state.locale,
      setLocale: state.setLocale,
    })),
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  return { locale, setLocale, t };
}

export function useT() {
  return useLocale().t;
}

/** Standalone translator for non-React modules (API client). */
export function t(
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  return translate(getActiveLocale(), key, params);
}

export { getActiveLocale, type Locale, type TranslationKey };
