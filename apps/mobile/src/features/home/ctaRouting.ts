import type { GuidanceSuggestion, TabRoute } from './types';

export type CtaResolution = {
  labelKey:
    | 'home.cta.logWorkout'
    | 'home.cta.logMeal'
    | 'home.cta.viewProgress'
    | 'home.cta.startDay';
  route: TabRoute;
};

export function resolveCtaFromGuidance(
  suggestions: GuidanceSuggestion[],
): CtaResolution {
  if (suggestions.length === 0) {
    return {
      labelKey: 'home.cta.startDay',
      route: '/(tabs)/training',
    };
  }

  const top = suggestions[0];

  switch (top.type) {
    case 'training':
      return {
        labelKey: 'home.cta.logWorkout',
        route: '/(tabs)/training',
      };
    case 'nutrition':
      return {
        labelKey: 'home.cta.logMeal',
        route: '/(tabs)/nutrition',
      };
    case 'progress':
    case 'general':
      return {
        labelKey: 'home.cta.viewProgress',
        route: '/(tabs)/progress',
      };
    default:
      return {
        labelKey: 'home.cta.viewProgress',
        route: '/(tabs)/progress',
      };
  }
}
