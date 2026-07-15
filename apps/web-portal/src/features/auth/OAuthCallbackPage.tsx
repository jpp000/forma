import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { t, useT } from '../../i18n';
import { useSessionStore } from '../../stores/sessionStore';
import { InlineError, Page } from '../../ui';

export function OAuthCallbackPage() {
  const translate = useT();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const signIn = useSessionStore((s) => s.signIn);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const token = params.get('accessToken');
    if (!token) {
      setError(t('auth.oauthMissingToken'));
      return;
    }

    void (async () => {
      try {
        await signIn(token);
        navigate('/', { replace: true });
      } catch {
        setError(t('auth.oauthFailed'));
      }
    })();
  }, [params, signIn, navigate]);

  return (
    <Page
      title={translate('auth.oauthSigningIn')}
      eyebrow={translate('auth.oauthEyebrow')}
    >
      {error ? (
        <InlineError>{error}</InlineError>
      ) : (
        <p>{translate('auth.oauthWait')}</p>
      )}
    </Page>
  );
}
