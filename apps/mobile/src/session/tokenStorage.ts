import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_KEY = 'forma.accessToken';

export type TokenStore = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

function isWebRuntime(): boolean {
  return typeof localStorage !== 'undefined';
}

const webStore: TokenStore = {
  async getItemAsync(key) {
    return localStorage.getItem(key);
  },
  async setItemAsync(key, value) {
    localStorage.setItem(key, value);
  },
  async deleteItemAsync(key) {
    localStorage.removeItem(key);
  },
};

const defaultStore: TokenStore = isWebRuntime() ? webStore : SecureStore;

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
