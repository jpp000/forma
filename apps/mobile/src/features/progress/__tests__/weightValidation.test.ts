import { parseWeightInput, validateLogWeight } from '../weightValidation';

const messages = {
  weightRequired: 'required',
  weightInvalid: 'invalid',
  weightRange: 'range',
  dateRequired: 'date required',
  dateInvalid: 'date invalid',
  dateFuture: 'future',
  dateTooOld: 'too old',
};

describe('parseWeightInput', () => {
  it('parses comma decimals', () => {
    expect(parseWeightInput('72,5')).toBe(72.5);
  });

  it('returns NaN for empty input', () => {
    expect(parseWeightInput('')).toBeNaN();
  });
});

describe('validateLogWeight', () => {
  it('requires weight', () => {
    expect(
      validateLogWeight({ weightKg: '', date: '2026-07-10' }, messages),
    ).toEqual({ weightKg: 'required' });
  });

  it('rejects invalid numbers', () => {
    expect(
      validateLogWeight({ weightKg: 'abc', date: '2026-07-10' }, messages),
    ).toEqual({ weightKg: 'invalid' });
  });

  it('rejects out-of-range weight', () => {
    expect(
      validateLogWeight({ weightKg: '501', date: '2026-07-10' }, messages),
    ).toEqual({ weightKg: 'range' });
  });

  it('accepts comma decimal weight', () => {
    expect(
      validateLogWeight({ weightKg: '72,5', date: '2026-07-10' }, messages),
    ).toBeNull();
  });

  it('blocks future dates', () => {
    expect(
      validateLogWeight(
        { weightKg: '72', date: '2099-01-01' },
        messages,
        '2026-07-10',
      ),
    ).toEqual({ date: 'future' });
  });

  it('blocks dates older than 365 days', () => {
    expect(
      validateLogWeight(
        { weightKg: '72', date: '2024-01-01' },
        messages,
        '2026-07-10',
      ),
    ).toEqual({ date: 'too old' });
  });

  it('rejects invalid date format', () => {
    expect(
      validateLogWeight({ weightKg: '72', date: '10-07-2026' }, messages),
    ).toEqual({ date: 'date invalid' });
  });

  it('accepts valid input', () => {
    expect(
      validateLogWeight({ weightKg: '72.5', date: '2026-07-10' }, messages),
    ).toBeNull();
  });
});
