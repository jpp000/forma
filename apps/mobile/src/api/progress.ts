import type { ApiClient } from './client';
import type { StreaksResponse } from '../features/home/types';

export type { StreaksResponse };

export type TrainingRestDay = {
  id: string;
  restDate: string;
  source: string;
};

export function createProgressApi(api: ApiClient) {
  return {
    getStreaks(): Promise<StreaksResponse> {
      return api.request('/api/progress/streaks');
    },

    markTrainingRestDay(date: string): Promise<TrainingRestDay> {
      return api.request('/api/progress/training-rest-days', {
        method: 'POST',
        body: { date },
      });
    },

    listTrainingRestDays(
      from?: string,
      to?: string,
    ): Promise<TrainingRestDay[]> {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const query = params.toString();
      return api.request(
        `/api/progress/training-rest-days${query ? `?${query}` : ''}`,
      );
    },
  };
}

export type ProgressApi = ReturnType<typeof createProgressApi>;
