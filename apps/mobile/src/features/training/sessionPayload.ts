import type { CreateWorkoutSessionInput } from './types';
import { todayUtcDate } from './todayStatus';

export type SessionSetInput = {
  reps: string;
  weightKg: string;
};

export type SessionExerciseInput = {
  exerciseId: string;
  sets: SessionSetInput[];
};

export type SessionFormInput = {
  planId?: string;
  completedAt: string;
  exercises: SessionExerciseInput[];
};

export type SessionValidationErrorCode =
  | 'session_requires_exercise'
  | 'session_invalid_set'
  | 'session_completed_not_today';

export type SessionBuildResult =
  | { ok: true; payload: CreateWorkoutSessionInput }
  | { ok: false; error: SessionValidationErrorCode };

export function buildSessionPayload(
  input: SessionFormInput,
): SessionBuildResult {
  const today = todayUtcDate();
  const completedDate = input.completedAt.slice(0, 10);
  if (completedDate !== today) {
    return { ok: false, error: 'session_completed_not_today' };
  }

  if (input.exercises.length === 0) {
    return { ok: false, error: 'session_requires_exercise' };
  }

  const exercises: CreateWorkoutSessionInput['exercises'] = [];

  for (const exercise of input.exercises) {
    if (!exercise.exerciseId || exercise.sets.length === 0) {
      return { ok: false, error: 'session_requires_exercise' };
    }

    const sets = exercise.sets.map((set) => {
      const reps = Number.parseInt(set.reps, 10);
      const weightKg = Number.parseFloat(set.weightKg);
      if (Number.isNaN(reps) || reps < 1 || Number.isNaN(weightKg) || weightKg < 0) {
        return null;
      }
      return { reps, weightKg };
    });

    if (sets.some((set) => set === null)) {
      return { ok: false, error: 'session_invalid_set' };
    }

    exercises.push({
      exerciseId: exercise.exerciseId,
      sets: sets as { reps: number; weightKg: number }[],
    });
  }

  return {
    ok: true,
    payload: {
      planId: input.planId,
      completedAt: input.completedAt,
      exercises,
    },
  };
}
