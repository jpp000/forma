import { create } from 'zustand';
import { mapApiError } from '../../api/mapApiError';
import type { StreaksResponse } from '../../api/progress';
import { getWiredProgressApi } from '../../api/wired';
import { todayUtcDate } from '../home/summaryMappers';
import type { LogWeightInput, WeightEntry } from './types';
import { defaultHistoryRange } from './weightMappers';

type HubErrors = {
  weight?: string;
  streaks?: string;
};

type ProgressState = {
  weightEntries: WeightEntry[];
  streaks: StreaksResponse | null;
  todayUtc: string;
  hubLoading: boolean;
  hubErrors: HubErrors;
  submitLoading: boolean;
  submitError: string | null;
  fetchHub: () => Promise<void>;
  logWeight: (input: LogWeightInput) => Promise<void>;
  clearSubmitError: () => void;
  reset: () => void;
};

const initialState = {
  weightEntries: [] as WeightEntry[],
  streaks: null as StreaksResponse | null,
  todayUtc: todayUtcDate(),
  hubLoading: false,
  hubErrors: {} as HubErrors,
  submitLoading: false,
  submitError: null as string | null,
};

let hubFetchGeneration = 0;

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...initialState,

  clearSubmitError: () => set({ submitError: null }),

  reset: () => {
    hubFetchGeneration += 1;
    set({ ...initialState, todayUtc: todayUtcDate() });
  },

  fetchHub: async () => {
    const generation = ++hubFetchGeneration;
    const today = todayUtcDate();
    const range = defaultHistoryRange(today);
    set({ hubLoading: true, hubErrors: {}, todayUtc: today });

    const progressApi = getWiredProgressApi();

    const [weightResult, streaksResult] = await Promise.allSettled([
      progressApi.getWeightHistory(range.from, range.to),
      progressApi.getStreaks(),
    ]);

    if (generation !== hubFetchGeneration) {
      return;
    }

    const hubErrors: HubErrors = {};
    let weightEntries = get().weightEntries;
    let streaks = get().streaks;

    if (weightResult.status === 'fulfilled') {
      weightEntries = weightResult.value;
    } else {
      hubErrors.weight = mapApiError(weightResult.reason);
    }

    if (streaksResult.status === 'fulfilled') {
      streaks = streaksResult.value;
    } else {
      hubErrors.streaks = mapApiError(streaksResult.reason);
    }

    set({
      weightEntries,
      streaks,
      hubLoading: false,
      hubErrors,
    });
  },

  logWeight: async (input) => {
    set({ submitLoading: true, submitError: null });
    try {
      const progressApi = getWiredProgressApi();
      await progressApi.logWeight(input);
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
