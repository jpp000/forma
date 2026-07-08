import type { ApiClient } from './client';

export type AuthResponse = {
  accessToken: string;
};

export type MeResponse = {
  id: string;
  email: string;
  roles: Array<'student' | 'trainer' | 'nutritionist'>;
};

export type OAuthProvider = 'google' | 'apple' | 'facebook';

export function createIdentityApi(api: ApiClient) {
  return {
    requestOtp(email: string): Promise<void> {
      return api.request('/api/identity/otp/request', {
        method: 'POST',
        body: { email },
      });
    },

    verifyOtp(email: string, code: string): Promise<AuthResponse> {
      return api.request('/api/identity/otp/verify', {
        method: 'POST',
        body: { email, code },
      });
    },

    me(): Promise<MeResponse> {
      return api.request('/api/identity/me');
    },

    /**
     * Builds the OAuth start URL. Callers open this via AuthSession / browser.
     * Pass platform=mobile when requesting the mobile redirect handoff (T19).
     */
    startOAuthUrl(
      provider: OAuthProvider,
      options?: { platform?: 'mobile' | 'web'; baseUrl?: string },
    ): string {
      const base =
        options?.baseUrl?.replace(/\/$/, '') ??
        (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
          /\/$/,
          '',
        );
      const params = new URLSearchParams();
      if (options?.platform) {
        params.set('platform', options.platform);
      }
      const query = params.toString();
      return `${base}/api/identity/oauth/${provider}${
        query ? `?${query}` : ''
      }`;
    },
  };
}

export type IdentityApi = ReturnType<typeof createIdentityApi>;
