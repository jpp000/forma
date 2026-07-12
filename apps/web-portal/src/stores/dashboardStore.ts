import { create } from 'zustand';
import type { CoachingStudentRow } from '../api/coaching';
import { mapApiError } from '../api/errors';
import { getCoachingApi } from '../api/wire';

type DashboardState = {
  students: CoachingStudentRow[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  students: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const { students } = await getCoachingApi().getDashboard();
      set({ students, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: mapApiError(error).message,
      });
    }
  },
}));
