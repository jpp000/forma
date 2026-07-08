import type { GuidanceSuggestion } from '../features/home/types';
import type { ApiClient } from './client';

export type { GuidanceSuggestion };

export function createGuidanceApi(api: ApiClient) {
  return {
    getDaily(): Promise<GuidanceSuggestion[]> {
      return api.request('/api/guidance/daily');
    },
  };
}

export type GuidanceApi = ReturnType<typeof createGuidanceApi>;
