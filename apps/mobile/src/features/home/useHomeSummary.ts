import { useCallback, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { createGuidanceApi } from '../../api/guidance';
import { createNutritionApi } from '../../api/nutrition';
import { createProgressApi } from '../../api/progress';
import { createTrainingApi } from '../../api/training';
import { useApiClient } from '../../api/useApiClient';
import { useSessionStore } from '../../stores/sessionStore';
import { useHomeStore } from './homeStore';

export function useHomeSummary() {
  const api = useApiClient();
  const deps = useMemo(
    () => ({
      nutrition: createNutritionApi(api),
      training: createTrainingApi(api),
      progress: createProgressApi(api),
      guidance: createGuidanceApi(api),
    }),
    [api],
  );

  const {
    status,
    today,
    rings,
    ringLegend,
    tiles,
    guidance,
    ringsError,
    tilesError,
    guidanceError,
    fatalError,
    cta,
    fetchSummary,
    refresh,
    reset,
  } = useHomeStore(
    useShallow((state) => ({
      status: state.status,
      today: state.today,
      rings: state.rings,
      ringLegend: state.ringLegend,
      tiles: state.tiles,
      guidance: state.guidance,
      ringsError: state.ringsError,
      tilesError: state.tilesError,
      guidanceError: state.guidanceError,
      fatalError: state.fatalError,
      cta: state.cta,
      fetchSummary: state.fetchSummary,
      refresh: state.refresh,
      reset: state.reset,
    })),
  );

  const token = useSessionStore((state) => state.token);

  useEffect(() => {
    if (status === 'idle' && token) {
      void fetchSummary(deps);
    }
  }, [deps, fetchSummary, status, token]);

  useEffect(() => {
    if (!token) {
      reset();
    }
  }, [reset, token]);

  const handleRefresh = useCallback(() => refresh(deps), [deps, refresh]);

  return {
    status,
    today,
    rings,
    ringLegend,
    tiles,
    guidance,
    ringsError,
    tilesError,
    guidanceError,
    fatalError,
    cta,
    refresh: handleRefresh,
  };
}
