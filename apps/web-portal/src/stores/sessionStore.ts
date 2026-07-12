import { create } from 'zustand';
import type { MeResponse } from '../api/identity';

const TOKEN_KEY = 'forma.portal.accessToken';

type SessionState = {
  token: string | null;
  user: MeResponse | null;
  isLoading: boolean;
  bootstrap: () => Promise<void>;
  signIn: (accessToken: string) => Promise<void>;
  clearSession: () => void;
  refreshMe: () => Promise<MeResponse | null>;
};

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

async function identityApi() {
  const { getIdentityApi } = await import('../api/wire');
  return getIdentityApi();
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  clearSession: () => {
    writeStoredToken(null);
    set({ token: null, user: null, isLoading: false });
  },

  refreshMe: async () => {
    if (!get().token) {
      set({ user: null });
      return null;
    }

    try {
      const me = await (await identityApi()).getMe();
      set({ user: me });
      return me;
    } catch {
      get().clearSession();
      return null;
    }
  },

  signIn: async (accessToken: string) => {
    writeStoredToken(accessToken);
    set({ token: accessToken });
    await get().refreshMe();
  },

  bootstrap: async () => {
    const stored = readStoredToken();
    if (!stored) {
      set({ isLoading: false, token: null, user: null });
      return;
    }

    set({ token: stored });
    try {
      const me = await (await identityApi()).getMe();
      set({ user: me });
    } catch {
      get().clearSession();
    } finally {
      set({ isLoading: false });
    }
  },
}));
