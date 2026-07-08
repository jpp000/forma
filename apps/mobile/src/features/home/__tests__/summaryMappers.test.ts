import {
  buildMetricTiles,
  buildRingLegend,
  computeExerciseProgress,
  computeMoveProgress,
  computeStandProgress,
  todayUtcDate,
} from '../summaryMappers';
import type { DailySummary, MacroTotals, WorkoutSession } from '../types';

const emptyMacros: MacroTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

function daily(
  consumed: Partial<MacroTotals>,
  target: MacroTotals | null = null,
): DailySummary {
  return {
    date: '2026-07-08',
    consumed: { ...emptyMacros, ...consumed },
    target,
  };
}

describe('todayUtcDate', () => {
  it('returns UTC date slice from ISO string', () => {
    expect(todayUtcDate(new Date('2026-07-08T23:30:00.000Z'))).toBe(
      '2026-07-08',
    );
  });
});

describe('computeMoveProgress', () => {
  it('caps progress at 1 when consumed exceeds target', () => {
    expect(computeMoveProgress(2500, 2000)).toBe(1);
  });

  it('returns ratio when under target', () => {
    expect(computeMoveProgress(1000, 2000)).toBe(0.5);
  });

  it('returns 0 when target is null', () => {
    expect(computeMoveProgress(1200, null)).toBe(0);
  });

  it('returns 0 when target is 0', () => {
    expect(computeMoveProgress(1200, 0)).toBe(0);
  });
});

describe('computeExerciseProgress', () => {
  const today = '2026-07-08';
  const sessions: WorkoutSession[] = [
    { id: '1', completedAt: '2026-07-08T10:00:00.000Z' },
    { id: '2', completedAt: '2026-07-07T10:00:00.000Z' },
  ];

  it('returns 1 when a session completed today exists', () => {
    expect(computeExerciseProgress(sessions, today)).toBe(1);
  });

  it('returns 0 when no session completed today', () => {
    expect(computeExerciseProgress([], today)).toBe(0);
    expect(
      computeExerciseProgress(
        [{ id: '3', completedAt: '2026-07-07T08:00:00.000Z' }],
        today,
      ),
    ).toBe(0);
  });
});

describe('computeStandProgress', () => {
  it('returns 1 when any macro is greater than zero', () => {
    expect(computeStandProgress({ calories: 0, protein: 5, carbs: 0, fat: 0 })).toBe(
      1,
    );
    expect(computeStandProgress({ calories: 10, protein: 0, carbs: 0, fat: 0 })).toBe(
      1,
    );
  });

  it('returns 0 when all macros are zero', () => {
    expect(computeStandProgress(emptyMacros)).toBe(0);
  });
});

describe('buildRingLegend', () => {
  it('shows consumed and target calories when target exists', () => {
    const legend = buildRingLegend(
      daily({ calories: 1500 }, { calories: 2000, protein: 150, carbs: 200, fat: 60 }),
      true,
      true,
    );

    expect(legend.move).toEqual({
      value: '1500',
      goal: '2000',
      hasTarget: true,
    });
    expect(legend.exercise.value).toBe('1');
    expect(legend.stand.value).toBe('1');
  });

  it('marks move legend without target when target is null', () => {
    const legend = buildRingLegend(daily({ calories: 800 }, null), false, false);

    expect(legend.move).toEqual({
      value: '800',
      goal: '',
      hasTarget: false,
    });
  });
});

describe('buildMetricTiles', () => {
  const streaks = {
    training: { current: 4, longest: 10 },
    nutrition: { current: 7, longest: 12 },
  };

  it('orders tiles as training streak, calories, protein, nutrition streak', () => {
    const tiles = buildMetricTiles(
      streaks,
      daily(
        { calories: 1800, protein: 120 },
        { calories: 2200, protein: 150, carbs: 200, fat: 70 },
      ),
    );

    expect(tiles.map((tile) => tile.id)).toEqual([
      'training-streak',
      'calories',
      'protein',
      'nutrition-streak',
    ]);
    expect(tiles[0].value).toBe('4');
    expect(tiles[1].value).toBe('1800/2200');
    expect(tiles[2].value).toBe('120/150');
    expect(tiles[3].value).toBe('7');
  });

  it('shows consumed only when nutrition target is null', () => {
    const tiles = buildMetricTiles(streaks, daily({ calories: 900, protein: 40 }, null));

    expect(tiles[1].value).toBe('900');
    expect(tiles[2].value).toBe('40');
  });

  it('flags per-source tile errors without blocking other tiles', () => {
    const tiles = buildMetricTiles(
      streaks,
      daily({ calories: 500, protein: 30 }),
      { streaks: true },
    );

    expect(tiles[0].error).toBe('errors.generic');
    expect(tiles[3].error).toBe('errors.generic');
    expect(tiles[1].error).toBeUndefined();
    expect(tiles[2].error).toBeUndefined();
  });
});
