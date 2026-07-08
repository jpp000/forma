import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createApiClient } from '../api/client';
import { createIdentityApi, type MeResponse } from '../api/identity';
import { getActiveLocale } from '../i18n';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './tokenStorage';

export type SessionUser = MeResponse;

type SessionContextValue = {
  token: string | null;
  user: SessionUser | null;
  isLoading: boolean;
  isStudent: boolean;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<SessionUser | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function isStudentUser(user: SessionUser | null): boolean {
  return user?.roles.includes('student') ?? false;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const signOut = useCallback(async () => {
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    await clearAccessToken();
  }, []);

  const identityApi = useMemo(() => {
    const api = createApiClient({
      getToken: () => tokenRef.current,
      getLocale: () => getActiveLocale(),
      onUnauthorized: () => {
        void signOut();
      },
    });
    return createIdentityApi(api);
  }, [signOut]);

  const refreshMe = useCallback(async (): Promise<SessionUser | null> => {
    if (!tokenRef.current) {
      setUser(null);
      return null;
    }

    try {
      const me = await identityApi.me();
      setUser(me);
      return me;
    } catch {
      await signOut();
      return null;
    }
  }, [identityApi, signOut]);

  const signIn = useCallback(
    async (accessToken: string) => {
      await setAccessToken(accessToken);
      tokenRef.current = accessToken;
      setToken(accessToken);
      await refreshMe();
    },
    [refreshMe],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = await getAccessToken();
      if (cancelled) {
        return;
      }

      if (!stored) {
        setIsLoading(false);
        return;
      }

      tokenRef.current = stored;
      setToken(stored);

      try {
        const me = await identityApi.me();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          await signOut();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [identityApi, signOut]);

  const value = useMemo<SessionContextValue>(
    () => ({
      token,
      user,
      isLoading,
      isStudent: isStudentUser(user),
      signIn,
      signOut,
      refreshMe,
    }),
    [token, user, isLoading, signIn, signOut, refreshMe],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
