import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getCoachingApi } from '../../api/wire';
import { useSessionStore } from '../../stores/sessionStore';
import { Button, InlineError, TextField } from '../../ui';
import { CheckoutPanel } from './CheckoutPanel';
import './onboarding.css';

type ProfileType = 'trainer' | 'nutritionist';

export function ProfileForm() {
  const navigate = useNavigate();
  const refreshMe = useSessionStore((s) => s.refreshMe);
  const [type, setType] = useState<ProfileType>('trainer');
  const [credentials, setCredentials] = useState('');
  const [credentialsError, setCredentialsError] = useState<string>();
  const [error, setError] = useState<string>();
  const [needsPaywall, setNeedsPaywall] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = credentials.trim();
    if (!trimmed) {
      setCredentialsError('Credentials are required');
      return;
    }

    setBusy(true);
    setError(undefined);
    setCredentialsError(undefined);
    setNeedsPaywall(false);

    try {
      await getCoachingApi().createProfile({ type, credentials: trimmed });
      await refreshMe();
      navigate('/');
    } catch (err) {
      const mapped = mapApiError(err);
      if (mapped.kind === 'payment_required') {
        setNeedsPaywall(true);
        setError(mapped.message);
      } else {
        setError(mapped.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fp-onboarding-stack">
      {needsPaywall ? <CheckoutPanel /> : null}
      <form
        className="fp-onboarding-panel"
        onSubmit={handleSubmit}
        data-testid="onboarding-profile-form"
      >
        <h2>Create your professional profile</h2>
        <fieldset className="fp-onboarding-type">
          <legend>Type</legend>
          <label>
            <input
              type="radio"
              name="type"
              checked={type === 'trainer'}
              onChange={() => setType('trainer')}
              data-testid="onboarding-type-trainer"
            />
            Trainer
          </label>
          <label>
            <input
              type="radio"
              name="type"
              checked={type === 'nutritionist'}
              onChange={() => setType('nutritionist')}
              data-testid="onboarding-type-nutritionist"
            />
            Nutritionist
          </label>
        </fieldset>
        <TextField
          label="Credentials"
          name="credentials"
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
          error={credentialsError}
          data-testid="onboarding-credentials-input"
        />
        {error ? <InlineError>{error}</InlineError> : null}
        <Button
          type="submit"
          disabled={busy}
          data-testid="onboarding-profile-submit"
        >
          Create profile
        </Button>
      </form>
    </div>
  );
}
