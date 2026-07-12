import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getIdentityApi } from '../../api/wire';
import { useSessionStore } from '../../stores/sessionStore';
import { Button, InlineError, Page, TextField } from '../../ui';
import './auth.css';

const OTP_LENGTH = 6;

export function OtpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const signIn = useSessionStore((s) => s.signIn);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!email) {
      setFormError('Missing email');
      return;
    }
    if (code.length !== OTP_LENGTH) {
      setCodeError('Enter the 6-digit code');
      return;
    }

    setBusy(true);
    setFormError(undefined);
    try {
      const { accessToken } = await getIdentityApi().verifyOtp(email, code);
      await signIn(accessToken);
      navigate('/');
    } catch (error) {
      setFormError(mapApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDevFill() {
    if (!email) {
      return;
    }
    try {
      const { code: mockCode } = await getIdentityApi().getDevLastOtp(email);
      setCode(mockCode);
      setCodeError(undefined);
    } catch (error) {
      setFormError(mapApiError(error).message);
    }
  }

  return (
    <Page title="Enter code" eyebrow="Auth">
      <form
        className="fp-auth-form"
        onSubmit={handleVerify}
        data-testid="auth-otp-screen"
      >
        <p className="fp-auth-hint">
          Code sent to <strong>{email || '—'}</strong>
        </p>
        <TextField
          label="Code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))
          }
          error={codeError}
          data-testid="auth-otp-input"
        />
        {formError ? <InlineError>{formError}</InlineError> : null}
        <Button
          type="submit"
          disabled={busy}
          data-testid="auth-otp-submit-button"
        >
          Verify
        </Button>
      </form>

      {import.meta.env.DEV ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleDevFill()}
          data-testid="auth-dev-otp-fill"
        >
          Dev: use mock code
        </Button>
      ) : null}

      <p className="fp-auth-hint">
        <Link to="/login">Back to login</Link>
      </p>
    </Page>
  );
}
