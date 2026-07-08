import { resolveCtaFromGuidance } from '../ctaRouting';
import type { GuidanceSuggestion } from '../types';

function suggestion(
  type: GuidanceSuggestion['type'],
  priority = 1,
): GuidanceSuggestion {
  return { type, message: `${type} message`, priority };
}

describe('resolveCtaFromGuidance', () => {
  it('maps training guidance to workout CTA and training tab', () => {
    expect(resolveCtaFromGuidance([suggestion('training')])).toEqual({
      labelKey: 'home.cta.logWorkout',
      route: '/(tabs)/training',
    });
  });

  it('maps nutrition guidance to meal CTA and nutrition tab', () => {
    expect(resolveCtaFromGuidance([suggestion('nutrition')])).toEqual({
      labelKey: 'home.cta.logMeal',
      route: '/(tabs)/nutrition',
    });
  });

  it('maps progress guidance to progress CTA and progress tab', () => {
    expect(resolveCtaFromGuidance([suggestion('progress')])).toEqual({
      labelKey: 'home.cta.viewProgress',
      route: '/(tabs)/progress',
    });
  });

  it('maps general guidance to progress CTA and progress tab', () => {
    expect(resolveCtaFromGuidance([suggestion('general')])).toEqual({
      labelKey: 'home.cta.viewProgress',
      route: '/(tabs)/progress',
    });
  });

  it('uses start-day fallback when guidance is empty', () => {
    expect(resolveCtaFromGuidance([])).toEqual({
      labelKey: 'home.cta.startDay',
      route: '/(tabs)/training',
    });
  });

  it('falls back to progress route for unknown guidance types', () => {
    expect(resolveCtaFromGuidance([suggestion('unknown-type')])).toEqual({
      labelKey: 'home.cta.viewProgress',
      route: '/(tabs)/progress',
    });
  });

  it('uses the first suggestion as highest priority', () => {
    expect(
      resolveCtaFromGuidance([
        suggestion('nutrition', 1),
        suggestion('training', 2),
      ]),
    ).toEqual({
      labelKey: 'home.cta.logMeal',
      route: '/(tabs)/nutrition',
    });
  });
});
