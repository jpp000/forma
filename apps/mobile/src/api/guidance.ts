import type { ApiClient } from './client';
import type { GuidanceSuggestion } from '../features/home/types';

export type { GuidanceSuggestion };

export function createGuidanceApi(api: ApiClient) {
  return {
    getDaily(): Promise<GuidanceSuggestion[]> {
      return api.request('/api/guidance/daily');
    },
  };
}

export type GuidanceApi = ReturnType<typeof createGuidanceApi>;
