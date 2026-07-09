import type { DailySummary } from '../features/home/types';
import type {
  LogMealInput,
  MealLogResponse,
} from '../features/nutrition/types';
import type { ApiClient } from './client';

export type NutritionApi = ReturnType<typeof createNutritionApi>;

export function createNutritionApi(api: ApiClient) {
  return {
    getDailySummary(date: string): Promise<DailySummary> {
      return api.request(
        `/api/nutrition/daily?date=${encodeURIComponent(date)}`,
      );
    },

    logMeal(input: LogMealInput): Promise<MealLogResponse> {
      return api.request('/api/nutrition/meals', {
        method: 'POST',
        body: input,
      });
    },
  };
}
