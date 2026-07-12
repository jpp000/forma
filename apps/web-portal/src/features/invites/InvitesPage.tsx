import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getCoachingApi } from '../../api/wire';
import { useT } from '../../i18n';
import { Button, InlineError, LocaleSwitcher, Page, TextField } from '../../ui';
import './invites.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InvitesPage() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError(t('invites.emailInvalid'));
      return;
    }

    setBusy(true);
    setEmailError(undefined);
    setFormError(undefined);
    setSuccess(undefined);

    try {
      await getCoachingApi().createInvite(trimmed);
      setSuccess(t('invites.success', { email: trimmed }));
      setEmail('');
    } catch (error) {
      setFormError(mapApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page
      title={t('invites.title')}
      eyebrow={t('invites.eyebrow')}
      actions={
        <>
          <LocaleSwitcher />
          <Link to="/">
            <Button type="button" variant="ghost">
              {t('common.backDashboard')}
            </Button>
          </Link>
        </>
      }
    >
      <form
        className="fp-invite-form"
        onSubmit={handleSubmit}
        data-testid="invite-form"
      >
        <TextField
          label={t('invites.emailLabel')}
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
          {t('invites.submit')}
        </Button>
      </form>
    </Page>
  );
}
