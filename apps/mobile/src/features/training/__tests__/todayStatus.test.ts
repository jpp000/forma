import type { TrainingRestDay } from '../../../api/progress';
import { resolveTodayStatus, todayUtcDate } from '../todayStatus';
import type { WorkoutSession } from '../types';

const today = '2026-07-08';

const session = (completedAt: string): WorkoutSession => ({
  id: 's1',
  userId: 'u1',
  planId: null,
  completedAt,
  exercises: [],
  createdAt: completedAt,
});

const restDay = (restDate: string): TrainingRestDay => ({
  id: 'r1',
  restDate,
  source: 'explicit',
});

describe('resolveTodayStatus', () => {
  it('returns workout when a session exists for today UTC', () => {
    expect(
      resolveTodayStatus(today, [session(`${today}T12:00:00.000Z`)], []),
    ).toBe('workout');
  });

  it('returns rest when rest day marked and no session today', () => {
    expect(resolveTodayStatus(today, [], [restDay(today)])).toBe('rest');
  });

  it('returns pending when neither session nor rest for today', () => {
    expect(resolveTodayStatus(today, [], [])).toBe('pending');
  });

  it('prefers workout over rest when both exist on same day', () => {
    expect(
      resolveTodayStatus(
        today,
        [session(`${today}T08:00:00.000Z`)],
        [restDay(today)],
      ),
    ).toBe('workout');
  });
});

describe('todayUtcDate', () => {
  it('returns YYYY-MM-DD in UTC', () => {
    const realDate = Date;
    const mockDate = class extends Date {
      constructor() {
        super('2026-07-08T15:30:00.000Z');
      }
    };
    global.Date = mockDate as DateConstructor;

    expect(todayUtcDate()).toBe('2026-07-08');

    global.Date = realDate;
  });
});
