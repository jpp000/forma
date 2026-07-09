import type { DailySummary, MacroKey, MacroRowModel } from './types';

export function macroProgress(
  consumed: number,
  target: number | null | undefined,
): number {
  if (target == null || target <= 0) {
    return 0;
  }
  return Math.min(consumed / target, 1);
}

export function formatMacroDisplay(
  consumed: number,
  target: number | null | undefined,
): { primary: string; showTarget: boolean } {
  if (target == null) {
    return { primary: String(consumed), showTarget: false };
  }
  return { primary: `${consumed} / ${target}`, showTarget: true };
}

export function buildMacroRows(summary: DailySummary | null): MacroRowModel[] {
  if (!summary) {
    return [];
  }

  const keys: MacroKey[] = ['calories', 'protein', 'carbs', 'fat'];

  return keys.map((key) => ({
    key,
    labelKey: `nutrition.macros.${key}`,
    consumed: summary.consumed[key],
    target: summary.target?.[key] ?? null,
    progress: macroProgress(summary.consumed[key], summary.target?.[key]),
  }));
}

export function isEmptyDay(summary: DailySummary | null): boolean {
  if (!summary) {
    return true;
  }
  const { calories, protein, carbs, fat } = summary.consumed;
  return calories === 0 && protein === 0 && carbs === 0 && fat === 0;
}
