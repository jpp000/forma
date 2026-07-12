import { describe, expect, it } from 'vitest';
import { ApiError } from '../client';
import { isProfessionalRole, mapApiError } from '../errors';

describe('mapApiError', () => {
  it('maps 401 to unauthorized', () => {
    const mapped = mapApiError(new ApiError(401, 'Unauthorized'));
    expect(mapped.kind).toBe('unauthorized');
    expect(mapped.status).toBe(401);
  });

  it('maps 402 to payment_required', () => {
    const mapped = mapApiError(new ApiError(402, 'Upgrade required'));
    expect(mapped.kind).toBe('payment_required');
    expect(mapped.status).toBe(402);
  });

  it('maps 403 to forbidden', () => {
    expect(mapApiError(new ApiError(403, 'Forbidden')).kind).toBe('forbidden');
  });

  it('maps 410 to gone', () => {
    expect(mapApiError(new ApiError(410, 'Gone')).kind).toBe('gone');
  });

  it('maps network TypeError', () => {
    expect(mapApiError(new TypeError('Failed to fetch')).kind).toBe('network');
  });
});

describe('isProfessionalRole', () => {
  it('returns true for trainer', () => {
    expect(isProfessionalRole(['trainer'])).toBe(true);
  });

  it('returns true for nutritionist', () => {
    expect(isProfessionalRole(['student', 'nutritionist'])).toBe(true);
  });

  it('returns false for student-only or empty', () => {
    expect(isProfessionalRole(['student'])).toBe(false);
    expect(isProfessionalRole([])).toBe(false);
    expect(isProfessionalRole(null)).toBe(false);
  });
});
