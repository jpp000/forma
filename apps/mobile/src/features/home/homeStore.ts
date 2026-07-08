import { create } from 'zustand';
import type { GuidanceApi } from '../../api/guidance';
import { mapApiError } from '../../api/mapApiError';
import type { NutritionApi } from '../../api/nutrition';
import type { ProgressApi } from '../../api/progress';
import type { TrainingApi } from '../../api/training';
import { type CtaResolution, resolveCtaFromGuidance } from './ctaRouting';
import {
  buildMetricTiles,
  buildRingLegend,
  computeExerciseProgress,
  computeMoveProgress,
  computeStandProgress,
  type RingLegendSet,
  type TileModel,
  todayUtcDate,
} from './summaryMappers';
import type {
  DailySummary,
  FetchStatus,
  GuidanceSuggestion,
  StreaksResponse,
  WorkoutSession,
} from './types';

export type HomeApiDeps = {
  nutrition: NutritionApi;
  training: TrainingApi;
  progress: ProgressApi;
  guidance: GuidanceApi;
};

type HomeStoreState = {
  status: FetchStatus;
  today: string;
  rings: { move: number; exercise: number; stand: number };
  ringLegend: RingLegendSet;
  tiles: TileModel[];
  guidance: GuidanceSuggestion[];
  ringsError?: string;
  tilesError?: string;
  guidanceError?: string;
  fatalError?: string;
  cta: CtaResolution;
  fetchSummary: (deps: HomeApiDeps) => Promise<void>;
  refresh: (deps: HomeApiDeps) => Promise<void>;
  reset: () => void;
};

const emptyLegend: RingLegendSet = {
  move: { value: '0', goal: '', hasTarget: false },
  exercise: { value: '0', goal: '—', hasTarget: true },
  stand: { value: '0', goal: '—', hasTarget: true },
};

const initialState = {
  status: 'idle' as FetchStatus,
  today: todayUtcDate(),
  rings: { move: 0, exercise: 0, stand: 0 },
  ringLegend: emptyLegend,
  tiles: buildMetricTiles(null, null),
  guidance: [] as GuidanceSuggestion[],
  cta: resolveCtaFromGuidance([]),
};

function toWorkoutSessions(
  items: Array<{ id: string; planId?: string | null; completedAt: string }>,
): WorkoutSession[] {
  return items.map((item) => ({
    id: item.id,
    planId: item.planId ?? null,
    completedAt: item.completedAt,
  }));
}

async function loadSummary(
  deps: HomeApiDeps,
  mode: 'loading' | 'refreshing',
  set: (
    partial:
      | Partial<HomeStoreState>
      | ((state: HomeStoreState) => Partial<HomeStoreState>),
  ) => void,
) {
  const today = todayUtcDate();
  set({
    status: mode,
    today,
    ringsError: undefined,
    tilesError: undefined,
    guidanceError: undefined,
    fatalError: undefined,
  });

  const [dailyResult, sessionsResult, streaksResult, guidanceResult] =
    await Promise.allSettled([
      deps.nutrition.getDailySummary(today),
      deps.training.listSessions(1, 20),
      deps.progress.getStreaks(),
      deps.guidance.getDaily(),
    ]);

  const rejections = [
    dailyResult,
    sessionsResult,
    streaksResult,
    guidanceResult,
  ].filter((result) => result.status === 'rejected');

  if (rejections.length === 4) {
    const firstError = rejections[0];
    set({
      status: 'error',
      fatalError:
        firstError.status === 'rejected'
          ? mapApiError(firstError.reason)
          : mapApiError(undefined),
      rings: { move: 0, exercise: 0, stand: 0 },
      ringLegend: emptyLegend,
      tiles: buildMetricTiles(null, null),
      guidance: [],
      cta: resolveCtaFromGuidance([]),
    });
    return;
  }

  let daily: DailySummary | null = null;
  let sessions: WorkoutSession[] = [];
  let streaks: StreaksResponse | null = null;
  let guidance: GuidanceSuggestion[] = [];

  let ringsError: string | undefined;
  let tilesError: string | undefined;
  let guidanceError: string | undefined;

  if (dailyResult.status === 'fulfilled') {
    daily = dailyResult.value;
  } else {
    const message = mapApiError(dailyResult.reason);
    ringsError = message;
    tilesError = message;
  }

  if (sessionsResult.status === 'fulfilled') {
    sessions = toWorkoutSessions(sessionsResult.value.items);
  } else {
    ringsError = ringsError ?? mapApiError(sessionsResult.reason);
  }

  if (streaksResult.status === 'fulfilled') {
    streaks = streaksResult.value;
  } else {
    tilesError = tilesError ?? mapApiError(streaksResult.reason);
  }

  if (guidanceResult.status === 'fulfilled') {
    guidance = guidanceResult.value;
  } else {
    guidanceError = mapApiError(guidanceResult.reason);
  }

  const exerciseDone = computeExerciseProgress(sessions, today) === 1;
  const mealLogged =
    daily !== null ? computeStandProgress(daily.consumed) === 1 : false;

  const rings = {
    move: daily
      ? computeMoveProgress(
          daily.consumed.calories,
          daily.target?.calories ?? null,
        )
      : 0,
    exercise: computeExerciseProgress(sessions, today),
    stand: daily ? computeStandProgress(daily.consumed) : 0,
  };

  const ringLegend = daily
    ? buildRingLegend(daily, exerciseDone, mealLogged)
    : emptyLegend;

  const tiles = buildMetricTiles(streaks, daily, {
    streaks: streaksResult.status === 'rejected',
    daily: dailyResult.status === 'rejected',
  });

  set({
    status: 'ready',
    today,
    rings,
    ringLegend,
    tiles,
    guidance,
    ringsError,
    tilesError,
    guidanceError,
    cta: resolveCtaFromGuidance(guidance),
  });
}

export const useHomeStore = create<HomeStoreState>((set) => ({
  ...initialState,
  fetchSummary: async (deps) => {
    await loadSummary(deps, 'loading', set);
  },
  refresh: async (deps) => {
    await loadSummary(deps, 'refreshing', set);
  },
  reset: () => {
    set({ ...initialState, today: todayUtcDate() });
  },
}));
