import type { TrainingRestDay, WorkoutSession } from './types';

export type TodayTrainingStatus = 'workout' | 'rest' | 'pending';

export function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function sessionUtcDate(session: WorkoutSession): string {
  return session.completedAt.slice(0, 10);
}

export function resolveTodayStatus(
  today: string,
  sessions: WorkoutSession[],
  restDays: TrainingRestDay[],
): TodayTrainingStatus {
  const hasWorkout = sessions.some(
    (session) => sessionUtcDate(session) === today,
  );
  if (hasWorkout) {
    return 'workout';
  }

  const hasRest = restDays.some((day) => day.restDate === today);
  if (hasRest) {
    return 'rest';
  }

  return 'pending';
}
