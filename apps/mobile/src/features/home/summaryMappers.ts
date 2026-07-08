import type {
  DailySummary,
  MacroTotals,
  StreaksResponse,
  WorkoutSession,
} from './types';

export function todayUtcDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function computeMoveProgress(
  consumed: number,
  target: number | null,
): number {
  if (target === null || target <= 0) {
    return 0;
  }
  return Math.min(consumed / target, 1);
}

export function computeExerciseProgress(
  sessions: WorkoutSession[],
  today: string,
): number {
  const hasSessionToday = sessions.some(
    (session) => session.completedAt.slice(0, 10) === today,
  );
  return hasSessionToday ? 1 : 0;
}

export function computeStandProgress(consumed: MacroTotals): number {
  const { calories, protein, carbs, fat } = consumed;
  return calories > 0 || protein > 0 || carbs > 0 || fat > 0 ? 1 : 0;
}

export type RingLegend = {
  value: string;
  goal: string;
  hasTarget: boolean;
};

export type RingLegendSet = {
  move: RingLegend;
  exercise: RingLegend;
  stand: RingLegend;
};

export function buildRingLegend(
  daily: DailySummary,
  exerciseDone: boolean,
  mealLogged: boolean,
): RingLegendSet {
  const calorieTarget = daily.target?.calories ?? null;
  const hasCalorieTarget = calorieTarget !== null && calorieTarget > 0;

  return {
    move: {
      value: String(daily.consumed.calories),
      goal: hasCalorieTarget ? String(calorieTarget) : '',
      hasTarget: hasCalorieTarget,
    },
    exercise: {
      value: exerciseDone ? '1' : '0',
      goal: '—',
      hasTarget: true,
    },
    stand: {
      value: mealLogged ? '1' : '0',
      goal: '—',
      hasTarget: true,
    },
  };
}

export type TileModel = {
  id: string;
  labelKey: string;
  value: string;
  accent?: 'award' | 'move' | 'exercise' | 'stand';
  error?: string;
};

type TileErrors = {
  streaks?: boolean;
  daily?: boolean;
};

function formatMacroValue(consumed: number, target: number | null): string {
  if (target === null) {
    return String(consumed);
  }
  return `${consumed}/${target}`;
}

export function buildMetricTiles(
  streaks: StreaksResponse | null,
  daily: DailySummary | null,
  errors: TileErrors = {},
): TileModel[] {
  const trainingStreak = streaks?.training.current ?? 0;
  const nutritionStreak = streaks?.nutrition.current ?? 0;

  const caloriesValue =
    daily !== null
      ? formatMacroValue(
          daily.consumed.calories,
          daily.target?.calories ?? null,
        )
      : '—';

  const proteinValue =
    daily !== null
      ? formatMacroValue(daily.consumed.protein, daily.target?.protein ?? null)
      : '—';

  return [
    {
      id: 'training-streak',
      labelKey: 'home.tiles.trainingStreak',
      value: String(trainingStreak),
      accent: 'award',
      error: errors.streaks ? 'errors.generic' : undefined,
    },
    {
      id: 'calories',
      labelKey: 'home.tiles.calories',
      value: caloriesValue,
      accent: 'move',
      error: errors.daily ? 'errors.generic' : undefined,
    },
    {
      id: 'protein',
      labelKey: 'home.tiles.protein',
      value: proteinValue,
      accent: 'exercise',
      error: errors.daily ? 'errors.generic' : undefined,
    },
    {
      id: 'nutrition-streak',
      labelKey: 'home.tiles.nutritionStreak',
      value: String(nutritionStreak),
      accent: 'award',
      error: errors.streaks ? 'errors.generic' : undefined,
    },
  ];
}
