jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'forma://oauth'),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

import { devMockSignIn, OAuthFailedError } from '../oauth';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('devMockSignIn', () => {
  it('returns accessToken from API mock OAuth chain', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ accessToken: 'jwt-mock' }), {
          status: 200,
        }),
      ) as unknown as typeof fetch;

    await expect(devMockSignIn()).resolves.toBe('jwt-mock');
  });

  it('fails when API is not in mock mode', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 })) as unknown as typeof fetch;

    await expect(devMockSignIn()).rejects.toBeInstanceOf(OAuthFailedError);
  });
});
