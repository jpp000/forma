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

type AuthResponse = { accessToken: string };

/**
 * Opens the API OAuth start URL in an auth session.
 *
 * **Dev/mock path:** when the API runs with `OAUTH_MOCK=true` (or without
 * provider client IDs), the start endpoint redirects to the callback URL which
 * returns JSON `{ accessToken }`. We fetch that URL after the session completes.
 *
 * Production mobile redirect (`platform=mobile`) is handled in T19.
 */
export async function startOAuth(provider: OAuthProvider): Promise<string> {
  const baseUrl = resolveApiBaseUrl();
  const identity = createIdentityApi(createApiClient({ baseUrl }));
  const startUrl = identity.startOAuthUrl(provider);
  const callbackPrefix = `${baseUrl}/api/identity/oauth/${provider}/callback`;

  const result = await WebBrowser.openAuthSessionAsync(
    startUrl,
    callbackPrefix,
  );

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new OAuthCancelledError();
  }

  if (result.type !== 'success' || !result.url) {
    throw new OAuthFailedError();
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
