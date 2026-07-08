import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createApiClient } from '../api/client';
import { createIdentityApi, type OAuthProvider } from '../api/identity';

WebBrowser.maybeCompleteAuthSession();

export class OAuthCancelledError extends Error {
  constructor() {
    super('OAuth cancelled');
    this.name = 'OAuthCancelledError';
  }
}

export class OAuthFailedError extends Error {
  constructor(message = 'OAuth failed') {
    super(message);
    this.name = 'OAuthFailedError';
  }
}

function resolveApiBaseUrl(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
}

function resolveOAuthSuccessUrl(): string {
  return (
    process.env.EXPO_PUBLIC_OAUTH_SUCCESS_URL ?? Linking.createURL('oauth')
  );
}

type AuthResponse = { accessToken: string };

/**
 * Opens the API OAuth start URL in an auth session.
 *
 * Requests `platform=mobile` so the API callback redirects to
 * `EXPO_PUBLIC_OAUTH_SUCCESS_URL` with `accessToken` when configured.
 * Falls back to parsing JSON from the callback URL in mock/dev without redirect.
 */
export async function startOAuth(provider: OAuthProvider): Promise<string> {
  const baseUrl = resolveApiBaseUrl();
  const successUrl = resolveOAuthSuccessUrl();
  const identity = createIdentityApi(createApiClient({ baseUrl }));
  const startUrl = identity.startOAuthUrl(provider, { platform: 'mobile' });
  const callbackPrefix = `${baseUrl}/api/identity/oauth/${provider}/callback`;

  const result = await WebBrowser.openAuthSessionAsync(startUrl, successUrl);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new OAuthCancelledError();
  }

  if (result.type !== 'success' || !result.url) {
    throw new OAuthFailedError();
  }

  const redirected = new URL(result.url);
  const tokenFromRedirect = redirected.searchParams.get('accessToken');
  if (tokenFromRedirect) {
    return tokenFromRedirect;
  }

  if (!result.url.startsWith(callbackPrefix)) {
    throw new OAuthFailedError('Unexpected OAuth redirect');
  }

  const response = await fetch(result.url);
  if (!response.ok) {
    throw new OAuthFailedError(`HTTP ${response.status}`);
  }

  const body = (await response.json()) as AuthResponse;
  if (!body.accessToken) {
    throw new OAuthFailedError('Missing accessToken');
  }

  return body.accessToken;
}

/**
 * Dev-only: signs in via the API's existing OAuth mock flow (no browser).
 * Uses the same endpoints as e2e — requires API mock mode (OAUTH_MOCK=true or no GOOGLE_CLIENT_ID).
 * Stripped from production builds via __DEV__ guard in UI.
 */
export async function devMockSignIn(): Promise<string> {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/identity/oauth/google`);

  if (!response.ok) {
    throw new OAuthFailedError(
      'Dev mock login requires API OAuth mock mode (OAUTH_MOCK=true)',
    );
  }

  const body = (await response.json()) as AuthResponse;
  if (!body.accessToken) {
    throw new OAuthFailedError('Missing accessToken');
  }

  return body.accessToken;
}
