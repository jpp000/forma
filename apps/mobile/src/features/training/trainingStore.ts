import { create } from 'zustand';
import { mapApiError } from '../../api/mapApiError';
import type { StreaksResponse } from '../../api/progress';
import type {
  CreateExerciseInput,
  CreateWorkoutPlanInput,
  CreateWorkoutSessionInput,
} from '../../api/training';
import { getWiredProgressApi, getWiredTrainingApi } from '../../api/wired';
import {
  resolveTodayStatus,
  todayUtcDate,
  type TodayTrainingStatus,
} from './todayStatus';
import type {
  TrainingExercise,
  TrainingRestDay,
  WorkoutPlan,
  WorkoutSession,
} from './types';

type HubErrors = {
  streaks?: string;
  sessions?: string;
  restDays?: string;
};

type TrainingState = {
  streaks: StreaksResponse | null;
  todayStatus: TodayTrainingStatus;
  todayUtc: string;
  sessions: WorkoutSession[];
  restDays: TrainingRestDay[];
  exercises: TrainingExercise[];
  plans: WorkoutPlan[];
  hubLoading: boolean;
  hubErrors: HubErrors;
  listLoading: boolean;
  listError: string | null;
  submitLoading: boolean;
  submitError: string | null;
  fetchHub: () => Promise<void>;
  fetchExercises: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  createExercise: (input: CreateExerciseInput) => Promise<void>;
  createPlan: (input: CreateWorkoutPlanInput) => Promise<void>;
  logSession: (input: CreateWorkoutSessionInput) => Promise<void>;
  markRestDay: (date?: string) => Promise<void>;
  clearSubmitError: () => void;
};

export const useTrainingStore = create<TrainingState>((set, get) => ({
  streaks: null,
  todayStatus: 'pending',
  todayUtc: todayUtcDate(),
  sessions: [],
  restDays: [],
  exercises: [],
  plans: [],
  hubLoading: false,
  hubErrors: {},
  listLoading: false,
  listError: null,
  submitLoading: false,
  submitError: null,

  clearSubmitError: () => set({ submitError: null }),

  fetchHub: async () => {
    const todayUtc = todayUtcDate();
    set({ hubLoading: true, hubErrors: {}, todayUtc });

    const [streaksResult, sessionsResult, restDaysResult] =
      await Promise.allSettled([
        getWiredProgressApi().getStreaks(),
        getWiredTrainingApi().listSessions(1, 20),
        getWiredProgressApi().listTrainingRestDays(todayUtc, todayUtc),
      ]);

    const hubErrors: HubErrors = {};
    let streaks: StreaksResponse | null = null;
    let sessions: WorkoutSession[] = [];
    let restDays: TrainingRestDay[] = [];

    if (streaksResult.status === 'fulfilled') {
      streaks = streaksResult.value;
    } else {
      hubErrors.streaks = mapApiError(streaksResult.reason);
    }

    if (sessionsResult.status === 'fulfilled') {
      sessions = sessionsResult.value.items;
    } else {
      hubErrors.sessions = mapApiError(sessionsResult.reason);
    }

    if (restDaysResult.status === 'fulfilled') {
      restDays = restDaysResult.value;
    } else {
      hubErrors.restDays = mapApiError(restDaysResult.reason);
    }

    set({
      hubLoading: false,
      hubErrors,
      sessions,
      restDays,
      streaks,
      todayStatus: resolveTodayStatus(todayUtc, sessions, restDays),
    });
  },

  fetchExercises: async () => {
    set({ listLoading: true, listError: null });
    try {
      const result = await getWiredTrainingApi().listExercises();
      set({ exercises: result.items, listLoading: false });
    } catch (error) {
      set({ listLoading: false, listError: mapApiError(error) });
    }
  },

  fetchPlans: async () => {
    set({ listLoading: true, listError: null });
    try {
      const result = await getWiredTrainingApi().listPlans();
      set({ plans: result.items, listLoading: false });
    } catch (error) {
      set({ listLoading: false, listError: mapApiError(error) });
    }
  },

  createExercise: async (input) => {
    set({ submitLoading: true, submitError: null });
    try {
      await getWiredTrainingApi().createExercise(input);
      await get().fetchExercises();
      set({ submitLoading: false });
    } catch (error) {
      set({ submitLoading: false, submitError: mapApiError(error) });
      throw error;
    }
  },

  createPlan: async (input) => {
    set({ submitLoading: true, submitError: null });
    try {
      await getWiredTrainingApi().createPlan(input);
      await get().fetchPlans();
      set({ submitLoading: false });
    } catch (error) {
      set({ submitLoading: false, submitError: mapApiError(error) });
      throw error;
    }
  },

  logSession: async (input) => {
    set({ submitLoading: true, submitError: null });
    try {
      await getWiredTrainingApi().logSession(input);
      set({ submitLoading: false });
      await get().fetchHub();
    } catch (error) {
      set({ submitLoading: false, submitError: mapApiError(error) });
      throw error;
    }
  },

  markRestDay: async (date) => {
    const restDate = date ?? todayUtcDate();
    set({ submitLoading: true, submitError: null });
    try {
      await getWiredProgressApi().markTrainingRestDay(restDate);
      set({ submitLoading: false });
      await get().fetchHub();
    } catch (error) {
      set({ submitLoading: false, submitError: mapApiError(error) });
      throw error;
    }
  },
}));
