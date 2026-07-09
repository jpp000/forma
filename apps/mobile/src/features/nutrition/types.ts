import type { MealType } from '@forma/types';
import type { DailySummary, MacroTotals } from '../home/types';

export type { DailySummary, MacroTotals };

export type MealItemInput = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealItemDraft = MealItemInput & { id: string };

export type LogMealInput = {
  mealType: MealType;
  date: string;
  items: MealItemInput[];
};

export type MealLogResponse = {
  id: string;
  mealType: MealType;
  logDate: string;
  items: Array<MealItemInput & { id: string }>;
};

export type MacroKey = keyof MacroTotals;

export type MacroRowModel = {
  key: MacroKey;
  labelKey: `nutrition.macros.${MacroKey}`;
  consumed: number;
  target: number | null;
  progress: number;
};
