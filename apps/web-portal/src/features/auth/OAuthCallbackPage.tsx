import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSessionStore } from '../../stores/sessionStore';
import { InlineError, Page } from '../../ui';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const signIn = useSessionStore((s) => s.signIn);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const token = params.get('accessToken');
    if (!token) {
      setError('Missing access token');
      return;
    }

    void (async () => {
      try {
        await signIn(token);
        navigate('/', { replace: true });
      } catch {
        setError('Could not complete sign-in');
      }
    })();
  }, [params, signIn, navigate]);

  return (
    <Page title="Signing in…" eyebrow="OAuth">
      {error ? <InlineError>{error}</InlineError> : <p>Please wait…</p>}
    </Page>
  );
}
