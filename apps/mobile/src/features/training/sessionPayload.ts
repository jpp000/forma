import { todayUtcDate } from './todayStatus';
import type { CreateWorkoutSessionInput } from './types';

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

function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return parsed >= 1 ? parsed : null;
}

function parseNonNegativeFloat(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }
  const parsed = Number.parseFloat(trimmed);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}

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
      const reps = parsePositiveInt(set.reps);
      const weightKg = parseNonNegativeFloat(set.weightKg);
      if (reps === null || weightKg === null) {
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
