export type OAuthProvider = 'google' | 'apple' | 'facebook';

export type OAuthProfile = {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
};

export const OAUTH_PROVIDERS: OAuthProvider[] = ['google', 'apple', 'facebook'];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return OAUTH_PROVIDERS.includes(value as OAuthProvider);
}
