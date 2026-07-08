import { isValidEmail } from '../validators';

describe('isValidEmail', () => {
  it('accepts a well-formed address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects missing @ or domain', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
  });

  it('trims surrounding whitespace before validation', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });
});
