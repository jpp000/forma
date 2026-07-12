import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getCoachingApi } from '../../api/wire';
import { Button, InlineError, Page, TextField } from '../../ui';
import './invites.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InvitesPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Enter a valid email');
      return;
    }

    setBusy(true);
    setEmailError(undefined);
    setFormError(undefined);
    setSuccess(undefined);

    try {
      await getCoachingApi().createInvite(trimmed);
      setSuccess(`Invite sent to ${trimmed}. It expires in 7 days.`);
      setEmail('');
    } catch (error) {
      setFormError(mapApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page
      title="Invite student"
      eyebrow="Coaching"
      actions={
        <Link to="/">
          <Button type="button" variant="ghost">
            Back to dashboard
          </Button>
        </Link>
      }
    >
      <form
        className="fp-invite-form"
        onSubmit={handleSubmit}
        data-testid="invite-form"
      >
        <TextField
          label="Student email"
          name="studentEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          data-testid="invite-email-input"
        />
        {formError ? <InlineError>{formError}</InlineError> : null}
        {success ? (
          <p className="fp-invite-success" data-testid="invite-success">
            {success}
          </p>
        ) : null}
        <Button type="submit" disabled={busy} data-testid="invite-submit">
          Send invite
        </Button>
      </form>
    </Page>
  );
}
