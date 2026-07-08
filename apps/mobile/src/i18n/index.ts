import { getLocales } from 'expo-localization';

import { en } from './en';
import { ptBR } from './pt-BR';

export type Locale = 'pt-BR' | 'en';

export type Translation = {
  home: {
    greeting: string;
    today: string;
    guidance: string;
    streak: string;
    training: string;
    nutrition: string;
    progress: string;
    startWorkout: string;
    logMeal: string;
    logWeight: string;
    planned: string;
    completed: string;
    remaining: string;
    kcal: string;
    sets: string;
    kg: string;
    thisWeek: string;
    protein: string;
  };
  guidance: {
    training_needed: string;
    meal_log_needed: string;
    protein_gap: string;
  };
  tabs: {
    home: string;
    training: string;
    nutrition: string;
    progress: string;
  };
  prototype: {
    variantA: string;
    variantB: string;
    variantC: string;
    summaryTitle: string;
    move: string;
    exercise: string;
    stand: string;
    kcal: string;
    min: string;
    hr: string;
    steps: string;
    distance: string;
    km: string;
    workouts: string;
    daysInARow: string;
    fitnessPlus: string;
    seeAll: string;
  };
};

const catalogs: Record<Locale, Translation> = {
  'pt-BR': ptBR,
  en,
};

export function resolveLocale(): Locale {
  const tag = getLocales()[0]?.languageTag ?? 'pt-BR';
  if (tag.startsWith('en')) return 'en';
  return 'pt-BR';
}

export function useTranslation(locale?: Locale) {
  const resolved = locale ?? resolveLocale();
  return { t: catalogs[resolved], locale: resolved };
}
