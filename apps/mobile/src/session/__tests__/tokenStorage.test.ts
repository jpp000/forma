import {
  ACCESS_TOKEN_KEY,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  type TokenStore,
} from '../tokenStorage';

function createMemoryStore(
  overrides: Partial<TokenStore> = {},
): TokenStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItemAsync: async (key) => data.get(key) ?? null,
    setItemAsync: async (key, value) => {
      data.set(key, value);
    },
    deleteItemAsync: async (key) => {
      data.delete(key);
    },
    ...overrides,
  };
}

describe('tokenStorage (MFOUND-06)', () => {
  it('stores and reads the access token via secure store', async () => {
    const store = createMemoryStore();

    await setAccessToken('jwt-abc', store);

    await expect(getAccessToken(store)).resolves.toBe('jwt-abc');
    expect(store.data.get(ACCESS_TOKEN_KEY)).toBe('jwt-abc');
  });

  it('clears the access token so subsequent reads are null', async () => {
    const store = createMemoryStore();
    await setAccessToken('jwt-abc', store);

    await clearAccessToken(store);

    await expect(getAccessToken(store)).resolves.toBeNull();
    expect(store.data.has(ACCESS_TOKEN_KEY)).toBe(false);
  });

  it('treats secure store read failures as logged out (null)', async () => {
    const store = createMemoryStore({
      getItemAsync: async () => {
        throw new Error('SecureStore unavailable');
      },
    });

    await expect(getAccessToken(store)).resolves.toBeNull();
  });
});
