import type { WorkoutPlanItemInput } from './types';

export type PlanFormItemInput = {
  exerciseId: string;
  sets: string;
  reps: string;
  restSeconds: string;
};

export type PlanFormInput = {
  name: string;
  items: PlanFormItemInput[];
};

export type PlanValidationErrorCode =
  | 'plan_name_required'
  | 'plan_requires_item'
  | 'plan_invalid_sets'
  | 'plan_invalid_reps'
  | 'plan_invalid_rest'
  | 'plan_invalid_exercise';

export type PlanValidationResult =
  | { ok: true; payload: { name: string; items: WorkoutPlanItemInput[] } }
  | { ok: false; error: PlanValidationErrorCode };

export function validatePlanForm(input: PlanFormInput): PlanValidationResult {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: 'plan_name_required' };
  }

  if (input.items.length === 0) {
    return { ok: false, error: 'plan_requires_item' };
  }

  const items: WorkoutPlanItemInput[] = [];

  for (const item of input.items) {
    if (!item.exerciseId) {
      return { ok: false, error: 'plan_invalid_exercise' };
    }

    const sets = Number.parseInt(item.sets, 10);
    const reps = Number.parseInt(item.reps, 10);
    const restSeconds = Number.parseInt(item.restSeconds, 10);

    if (Number.isNaN(sets) || sets < 1) {
      return { ok: false, error: 'plan_invalid_sets' };
    }
    if (Number.isNaN(reps) || reps < 1) {
      return { ok: false, error: 'plan_invalid_reps' };
    }
    if (Number.isNaN(restSeconds) || restSeconds < 0) {
      return { ok: false, error: 'plan_invalid_rest' };
    }

    items.push({
      exerciseId: item.exerciseId,
      sets,
      reps,
      restSeconds,
    });
  }

  return { ok: true, payload: { name, items } };
}
