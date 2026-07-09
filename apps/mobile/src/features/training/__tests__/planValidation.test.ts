import { validatePlanForm } from '../planValidation';
import { buildSessionPayload } from '../sessionPayload';

describe('validatePlanForm', () => {
  it('accepts valid plan with one item', () => {
    const result = validatePlanForm({
      name: 'Leg Day',
      items: [
        {
          exerciseId: 'ex-1',
          sets: '3',
          reps: '10',
          restSeconds: '60',
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.name).toBe('Leg Day');
      expect(result.payload.items[0]).toEqual({
        exerciseId: 'ex-1',
        sets: 3,
        reps: 10,
        restSeconds: 60,
      });
    }
  });

  it('rejects plan without items', () => {
    const result = validatePlanForm({ name: 'Empty', items: [] });
    expect(result).toEqual({ ok: false, error: 'plan_requires_item' });
  });

  it('rejects empty plan name', () => {
    const result = validatePlanForm({
      name: '   ',
      items: [
        {
          exerciseId: 'ex-1',
          sets: '3',
          reps: '10',
          restSeconds: '60',
        },
      ],
    });

    expect(result).toEqual({ ok: false, error: 'plan_name_required' });
  });

  it('rejects invalid sets count', () => {
    const result = validatePlanForm({
      name: 'Leg Day',
      items: [
        {
          exerciseId: 'ex-1',
          sets: '0',
          reps: '10',
          restSeconds: '60',
        },
      ],
    });

    expect(result).toEqual({ ok: false, error: 'plan_invalid_sets' });
  });
});

describe('buildSessionPayload', () => {
  const realDate = Date;

  afterEach(() => {
    global.Date = realDate;
  });

  it('rejects session with no exercises', () => {
    global.Date = class extends Date {
      constructor() {
        super('2026-07-08T12:00:00.000Z');
      }
    } as DateConstructor;

    const result = buildSessionPayload({
      completedAt: '2026-07-08T18:00:00.000Z',
      exercises: [],
    });
    expect(result).toEqual({ ok: false, error: 'session_requires_exercise' });
  });

  it('rejects completedAt before today UTC', () => {
    global.Date = class extends Date {
      constructor() {
        super('2026-07-08T12:00:00.000Z');
      }
    } as DateConstructor;

    const result = buildSessionPayload({
      completedAt: '2026-07-07T18:00:00.000Z',
      exercises: [
        {
          exerciseId: 'ex1',
          sets: [{ reps: '10', weightKg: '60' }],
        },
      ],
    });
    expect(result).toEqual({ ok: false, error: 'session_completed_not_today' });
  });

  it('rejects partial numeric strings in sets', () => {
    global.Date = class extends Date {
      constructor() {
        super('2026-07-08T12:00:00.000Z');
      }
    } as DateConstructor;

    const result = buildSessionPayload({
      completedAt: '2026-07-08T18:00:00.000Z',
      exercises: [
        {
          exerciseId: 'ex1',
          sets: [{ reps: '10abc', weightKg: '60' }],
        },
      ],
    });
    expect(result).toEqual({ ok: false, error: 'session_invalid_set' });
  });

  it('builds payload with planId and parsed sets', () => {
    global.Date = class extends Date {
      constructor() {
        super('2026-07-08T12:00:00.000Z');
      }
    } as DateConstructor;

    const result = buildSessionPayload({
      planId: 'plan1',
      completedAt: '2026-07-08T18:00:00.000Z',
      exercises: [
        {
          exerciseId: 'ex1',
          sets: [
            { reps: '10', weightKg: '60' },
            { reps: '8', weightKg: '65' },
          ],
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.planId).toBe('plan1');
      expect(result.payload.exercises).toEqual([
        {
          exerciseId: 'ex1',
          sets: [
            { reps: 10, weightKg: 60 },
            { reps: 8, weightKg: 65 },
          ],
        },
      ]);
    }
  });
});
