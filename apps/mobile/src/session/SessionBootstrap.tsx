import { useEffect } from 'react';
import { useSessionStore } from '../stores/sessionStore';

/** Restores JWT from SecureStore and loads /identity/me on app mount. */
export function SessionBootstrap() {
  useEffect(() => {
    void useSessionStore.getState().bootstrap();
  }, []);

  return null;
}
