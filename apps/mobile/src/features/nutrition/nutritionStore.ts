import { create } from 'zustand';
import { mapApiError } from '../../api/mapApiError';
import type { StreaksResponse } from '../../api/progress';
import { getWiredNutritionApi, getWiredProgressApi } from '../../api/wired';
import { todayUtcDate } from '../home/summaryMappers';
import type { DailySummary, LogMealInput } from './types';

type HubErrors = {
  daily?: string;
  streaks?: string;
};

type NutritionState = {
  dailySummary: DailySummary | null;
  streaks: StreaksResponse | null;
  todayUtc: string;
  hubLoading: boolean;
  hubErrors: HubErrors;
  submitLoading: boolean;
  submitError: string | null;
  fetchHub: () => Promise<void>;
  logMeal: (input: Omit<LogMealInput, 'date'>) => Promise<void>;
  clearSubmitError: () => void;
  reset: () => void;
};

const initialState = {
  dailySummary: null as DailySummary | null,
  streaks: null as StreaksResponse | null,
  todayUtc: todayUtcDate(),
  hubLoading: false,
  hubErrors: {} as HubErrors,
  submitLoading: false,
  submitError: null as string | null,
};

let hubFetchGeneration = 0;

export const useNutritionStore = create<NutritionState>((set, get) => ({
  ...initialState,

  clearSubmitError: () => set({ submitError: null }),

  reset: () => {
    hubFetchGeneration += 1;
    set({ ...initialState, todayUtc: todayUtcDate() });
  },

  fetchHub: async () => {
    const generation = ++hubFetchGeneration;
    const today = todayUtcDate();
    set({ hubLoading: true, hubErrors: {}, todayUtc: today });

    const nutritionApi = getWiredNutritionApi();
    const progressApi = getWiredProgressApi();

    const [dailyResult, streaksResult] = await Promise.allSettled([
      nutritionApi.getDailySummary(today),
      progressApi.getStreaks(),
    ]);

    if (generation !== hubFetchGeneration) {
      return;
    }

    const hubErrors: HubErrors = {};
    let dailySummary = get().dailySummary;
    let streaks = get().streaks;

    if (dailyResult.status === 'fulfilled') {
      dailySummary = dailyResult.value;
    } else {
      hubErrors.daily = mapApiError(dailyResult.reason);
    }

    if (streaksResult.status === 'fulfilled') {
      streaks = streaksResult.value;
    } else {
      hubErrors.streaks = mapApiError(streaksResult.reason);
    }

    set({
      dailySummary,
      streaks,
      hubLoading: false,
      hubErrors,
    });
  },

  logMeal: async (input) => {
    set({ submitLoading: true, submitError: null });
    try {
      const nutritionApi = getWiredNutritionApi();
      await nutritionApi.logMeal({
        ...input,
        date: todayUtcDate(),
      });
      await get().fetchHub();
      set({ submitLoading: false });
    } catch (error) {
      set({
        submitLoading: false,
        submitError: mapApiError(error),
      });
      throw error;
    }
  },
}));
