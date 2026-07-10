import { todayUtcDate } from '../home/summaryMappers';
import type { WeightEntry, WeightHistoryRowModel, WeightTrend } from './types';

const TREND_THRESHOLD_KG = 0.2;

export function normalizeLogDate(logDate: string): string {
  return logDate.slice(0, 10);
}

export function defaultHistoryRange(today = todayUtcDate()): {
  from: string;
  to: string;
} {
  const end = new Date(`${today}T00:00:00.000Z`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 89);
  return {
    from: start.toISOString().slice(0, 10),
    to: today,
  };
}

export function sortWeightEntries(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) =>
    normalizeLogDate(a.logDate).localeCompare(normalizeLogDate(b.logDate)),
  );
}

export function latestWeight(entries: WeightEntry[]): WeightEntry | null {
  const sorted = sortWeightEntries(entries);
  if (sorted.length === 0) {
    return null;
  }
  return sorted[sorted.length - 1];
}

export function computeWeightTrend(entries: WeightEntry[]): WeightTrend | null {
  const sorted = sortWeightEntries(entries);
  if (sorted.length < 2) {
    return null;
  }

  const latest = sorted[sorted.length - 1].weightKg;
  const previous = sorted[sorted.length - 2].weightKg;
  const diff = latest - previous;

  if (diff > TREND_THRESHOLD_KG) {
    return 'up';
  }
  if (diff < -TREND_THRESHOLD_KG) {
    return 'down';
  }
  return 'stable';
}

export function formatWeightKg(value: number): string {
  return value.toFixed(1);
}

export function formatDeltaKg(delta: number): string {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)} kg`;
}

export function buildHistoryRows(
  entries: WeightEntry[],
): WeightHistoryRowModel[] {
  const sorted = sortWeightEntries(entries);

  return [...sorted].reverse().map((entry, reverseIndex) => {
    const chronologicalIndex = sorted.length - 1 - reverseIndex;
    const previous = sorted[chronologicalIndex - 1];
    const row: WeightHistoryRowModel = {
      id: entry.id,
      date: normalizeLogDate(entry.logDate),
      weightLabel: `${formatWeightKg(entry.weightKg)} kg`,
    };

    if (previous) {
      const delta = entry.weightKg - previous.weightKg;
      row.deltaLabel = formatDeltaKg(delta);
      row.deltaPositive = delta > 0;
    }

    return row;
  });
}
