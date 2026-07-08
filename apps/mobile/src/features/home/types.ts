export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailySummary = {
  date: string;
  consumed: MacroTotals;
  target: MacroTotals | null;
};

export type WorkoutSession = {
  id: string;
  planId?: string | null;
  completedAt: string;
};

export type StreakPair = {
  current: number;
  longest: number;
};

export type StreaksResponse = {
  training: StreakPair;
  nutrition: StreakPair;
};

export type GuidanceSuggestion = {
  type: 'training' | 'nutrition' | 'progress' | 'general' | string;
  message: string;
  priority: number;
};

export type TabRoute =
  | '/(tabs)/training'
  | '/(tabs)/nutrition'
  | '/(tabs)/progress';

export type FetchStatus = 'idle' | 'loading' | 'refreshing' | 'ready' | 'error';
