import { describe, expect, it } from 'vitest';
import en from '../en';
import ptBR from '../pt-BR';

describe('invite success copy', () => {
  it('mentions 7-day expiry in en and pt-BR', () => {
    expect(en['invites.success']).toMatch(/7 days/i);
    expect(ptBR['invites.success']).toMatch(/7 dias/i);
  });
});
