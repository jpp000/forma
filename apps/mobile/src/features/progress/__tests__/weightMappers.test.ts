import type { WeightEntry } from '../types';
import {
  buildHistoryRows,
  computeWeightTrend,
  defaultHistoryRange,
  formatWeightKg,
  latestWeight,
  sortWeightEntries,
} from '../weightMappers';

const entry = (
  logDate: string,
  weightKg: number,
  id = logDate,
): WeightEntry => ({
  id,
  userId: 'user-1',
  weightKg,
  logDate: `${logDate}T00:00:00.000Z`,
  createdAt: `${logDate}T00:00:00.000Z`,
  updatedAt: `${logDate}T00:00:00.000Z`,
});

describe('defaultHistoryRange', () => {
  it('returns a 90-day inclusive window ending on today', () => {
    expect(defaultHistoryRange('2026-07-10')).toEqual({
      from: '2026-04-12',
      to: '2026-07-10',
    });
  });
});

describe('sortWeightEntries', () => {
  it('sorts unsorted entries ascending by logDate', () => {
    const sorted = sortWeightEntries([
      entry('2026-07-07', 75),
      entry('2026-07-01', 76),
      entry('2026-07-03', 74.5),
    ]);
    expect(sorted.map((row) => row.logDate.slice(0, 10))).toEqual([
      '2026-07-01',
      '2026-07-03',
      '2026-07-07',
    ]);
  });
});

describe('latestWeight', () => {
  it('returns the most recent entry', () => {
    expect(
      latestWeight([entry('2026-07-01', 76), entry('2026-07-07', 75)])
        ?.weightKg,
    ).toBe(75);
  });

  it('returns null when empty', () => {
    expect(latestWeight([])).toBeNull();
  });
});

describe('computeWeightTrend', () => {
  it('returns null when fewer than two entries', () => {
    expect(computeWeightTrend([entry('2026-07-01', 75)])).toBeNull();
    expect(computeWeightTrend([])).toBeNull();
  });

  it('returns up when latest exceeds previous by more than 0.2 kg', () => {
    expect(
      computeWeightTrend([entry('2026-07-01', 75), entry('2026-07-07', 75.5)]),
    ).toBe('up');
  });

  it('returns down when latest is below previous by more than 0.2 kg', () => {
    expect(
      computeWeightTrend([entry('2026-07-01', 75), entry('2026-07-07', 74.5)]),
    ).toBe('down');
  });

  it('returns stable within the 0.2 kg threshold', () => {
    expect(
      computeWeightTrend([entry('2026-07-01', 75), entry('2026-07-07', 75.1)]),
    ).toBe('stable');
  });
});

describe('formatWeightKg', () => {
  it('formats to one decimal place', () => {
    expect(formatWeightKg(72.54)).toBe('72.5');
  });
});

describe('buildHistoryRows', () => {
  it('lists entries newest-first with signed deltas', () => {
    const rows = buildHistoryRows([
      entry('2026-07-01', 76),
      entry('2026-07-03', 75.5),
      entry('2026-07-07', 75),
    ]);

    expect(rows.map((row) => row.date)).toEqual([
      '2026-07-07',
      '2026-07-03',
      '2026-07-01',
    ]);
    expect(rows[0].deltaLabel).toBe('-0.5 kg');
    expect(rows[1].deltaLabel).toBe('-0.5 kg');
    expect(rows[2].deltaLabel).toBeUndefined();
  });
});
