import type { DailySummary } from '../features/home/types';
import type { ApiClient } from './client';

export type { DailySummary };

export function createNutritionApi(api: ApiClient) {
  return {
    getDailySummary(date: string): Promise<DailySummary> {
      return api.request(
        `/api/nutrition/daily?date=${encodeURIComponent(date)}`,
      );
    },
  };
}

export type NutritionApi = ReturnType<typeof createNutritionApi>;
