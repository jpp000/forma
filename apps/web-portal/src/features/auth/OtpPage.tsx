import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getIdentityApi } from '../../api/wire';
import { useT } from '../../i18n';
import { useSessionStore } from '../../stores/sessionStore';
import { Button, InlineError, LocaleSwitcher, Page, TextField } from '../../ui';
import './auth.css';

const OTP_LENGTH = 6;

export function OtpPage() {
  const t = useT();
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
      setFormError(t('errors.missingEmail'));
      return;
    }
    if (code.length !== OTP_LENGTH) {
      setCodeError(t('auth.otpInvalid'));
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
    <Page
      title={t('auth.otpTitle')}
      eyebrow={t('auth.otpEyebrow')}
      actions={<LocaleSwitcher />}
    >
      <form
        className="fp-auth-form"
        onSubmit={handleVerify}
        data-testid="auth-otp-screen"
      >
        <p className="fp-auth-hint">
          {t('auth.otpSentTo')} <strong>{email || '—'}</strong>
        </p>
        <TextField
          label={t('auth.otpLabel')}
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
          {t('auth.otpSubmit')}
        </Button>
      </form>

      {import.meta.env.DEV ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleDevFill()}
          data-testid="auth-dev-otp-fill"
        >
          {t('auth.devOtpFill')}
        </Button>
      ) : null}

      <p className="fp-auth-hint">
        <Link to="/login">{t('auth.backLogin')}</Link>
      </p>
    </Page>
  );
}
