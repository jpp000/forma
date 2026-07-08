import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { MeResponse } from '../api/identity';
import { getWiredIdentityApi, wireApiStores } from '../api/wired';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../session/tokenStorage';
import { getActiveLocale } from './localeStore';

export type SessionUser = MeResponse;

type SessionState = {
  token: string | null;
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<SessionUser | null>;
  bootstrap: () => Promise<void>;
};

function isStudentUser(user: SessionUser | null): boolean {
  return user?.roles.includes('student') ?? false;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  signOut: async () => {
    set({ token: null, user: null });
    await clearAccessToken();
  },

  refreshMe: async () => {
    if (!get().token) {
      set({ user: null });
      return null;
    }

    try {
      const me = await getWiredIdentityApi().me();
      set({ user: me });
      return me;
    } catch {
      await get().signOut();
      return null;
    }
  },

  signIn: async (accessToken: string) => {
    await setAccessToken(accessToken);
    set({ token: accessToken });
    await get().refreshMe();
  },

  bootstrap: async () => {
    const stored = await getAccessToken();
    if (!stored) {
      set({ isLoading: false });
      return;
    }

    set({ token: stored });

    try {
      const me = await getWiredIdentityApi().me();
      set({ user: me });
    } catch {
      await get().signOut();
    } finally {
      set({ isLoading: false });
    }
  },
}));

wireApiStores({
  getToken: () => useSessionStore.getState().token,
  getLocale: () => getActiveLocale(),
  onUnauthorized: () => {
    void useSessionStore.getState().signOut();
  },
});

export function useSession() {
  const session = useSessionStore(
    useShallow((state) => ({
      token: state.token,
      user: state.user,
      isLoading: state.isLoading,
      signIn: state.signIn,
      signOut: state.signOut,
      refreshMe: state.refreshMe,
    })),
  );

  return {
    ...session,
    isStudent: isStudentUser(session.user),
  };
}
