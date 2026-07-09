import {
  buildMacroRows,
  formatMacroDisplay,
  isEmptyDay,
  macroProgress,
} from '../macroProgress';
import type { DailySummary } from '../types';

describe('macroProgress', () => {
  it('caps progress at 1 when consumed exceeds target', () => {
    expect(macroProgress(2500, 2000)).toBe(1);
  });

  it('returns 0 when target is null or zero', () => {
    expect(macroProgress(500, null)).toBe(0);
    expect(macroProgress(500, 0)).toBe(0);
  });

  it('computes fractional progress', () => {
    expect(macroProgress(500, 2000)).toBe(0.25);
  });
});

describe('formatMacroDisplay', () => {
  it('shows consumed only when target is null', () => {
    expect(formatMacroDisplay(400, null)).toEqual({
      primary: '400',
      showTarget: false,
    });
  });

  it('shows consumed / target when target exists', () => {
    expect(formatMacroDisplay(400, 2000)).toEqual({
      primary: '400 / 2000',
      showTarget: true,
    });
  });
});

describe('buildMacroRows', () => {
  const summary: DailySummary = {
    date: '2026-07-09',
    consumed: { calories: 400, protein: 35, carbs: 10, fat: 12 },
    target: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
  };

  it('builds four macro rows in order', () => {
    const rows = buildMacroRows(summary);
    expect(rows.map((row) => row.key)).toEqual([
      'calories',
      'protein',
      'carbs',
      'fat',
    ]);
    expect(rows[0].progress).toBe(0.2);
  });
});

describe('isEmptyDay', () => {
  it('returns true when all macros are zero', () => {
    expect(
      isEmptyDay({
        date: '2026-07-09',
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        target: null,
      }),
    ).toBe(true);
  });

  it('returns false when any macro is logged', () => {
    expect(
      isEmptyDay({
        date: '2026-07-09',
        consumed: { calories: 0, protein: 1, carbs: 0, fat: 0 },
        target: null,
      }),
    ).toBe(false);
  });
});
