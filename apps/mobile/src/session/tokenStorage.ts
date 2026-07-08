import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_KEY = 'forma.accessToken';

export type TokenStore = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

const defaultStore: TokenStore = SecureStore;

export async function getAccessToken(
  store: TokenStore = defaultStore,
): Promise<string | null> {
  try {
    return await store.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAccessToken(
  token: string,
  store: TokenStore = defaultStore,
): Promise<void> {
  await store.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken(
  store: TokenStore = defaultStore,
): Promise<void> {
  await store.deleteItemAsync(ACCESS_TOKEN_KEY);
}
