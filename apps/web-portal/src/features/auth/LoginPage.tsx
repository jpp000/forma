import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getIdentityApi } from '../../api/wire';
import { useSessionStore } from '../../stores/sessionStore';
import { Button, InlineError, Page, TextField } from '../../ui';
import './auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const signIn = useSessionStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleRequestOtp(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Enter a valid email');
      return;
    }

    setBusy(true);
    setFormError(undefined);
    setEmailError(undefined);
    try {
      await getIdentityApi().requestOtp(trimmed);
      navigate(`/login/otp?email=${encodeURIComponent(trimmed)}`);
    } catch (error) {
      setFormError(mapApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  function oauthHref(provider: 'google' | 'apple' | 'facebook') {
    return `${apiBaseUrl()}/api/identity/oauth/${provider}?platform=web`;
  }

  async function handleDevMockLogin() {
    setBusy(true);
    setFormError(undefined);
    try {
      const emailAddress = 'oauth-test@example.com';
      await getIdentityApi().requestOtp(emailAddress);
      const { code } = await getIdentityApi().getDevLastOtp(emailAddress);
      const { accessToken } = await getIdentityApi().verifyOtp(
        emailAddress,
        code,
      );
      await signIn(accessToken);
      navigate('/');
    } catch (error) {
      setFormError(mapApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page title="Forma" eyebrow="Portal">
      <form
        className="fp-auth-form"
        onSubmit={handleRequestOtp}
        data-testid="auth-screen"
      >
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          data-testid="auth-email-input"
        />
        {formError ? <InlineError>{formError}</InlineError> : null}
        <Button
          type="submit"
          disabled={busy}
          data-testid="auth-request-otp-button"
        >
          Continue with email
        </Button>
      </form>

      <div className="fp-auth-oauth">
        <a className="fp-auth-oauth__link" href={oauthHref('google')}>
          Continue with Google
        </a>
        <a className="fp-auth-oauth__link" href={oauthHref('apple')}>
          Continue with Apple
        </a>
        <a className="fp-auth-oauth__link" href={oauthHref('facebook')}>
          Continue with Facebook
        </a>
      </div>

      {import.meta.env.DEV ? (
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => void handleDevMockLogin()}
          data-testid="auth-dev-mock-login"
        >
          Dev: quick login (mock)
        </Button>
      ) : null}

      <p className="fp-auth-hint">
        Already verifying a code? <Link to="/login/otp">Enter OTP</Link>
      </p>
    </Page>
  );
}
