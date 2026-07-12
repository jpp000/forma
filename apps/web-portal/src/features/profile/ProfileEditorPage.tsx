import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getCoachingApi } from '../../api/wire';
import { useT } from '../../i18n';
import { Button, InlineError, LocaleSwitcher, Page, TextField } from '../../ui';
import './profile.css';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function ProfileEditorPage() {
  const t = useT();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState('');
  const [credentials, setCredentials] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [slugError, setSlugError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const profile = await getCoachingApi().getProfile();
        if (cancelled) return;
        setDisplayName(profile.displayName ?? '');
        setBio(profile.bio ?? '');
        setSlug(profile.slug ?? '');
        setCredentials(profile.credentials ?? '');
        setIsPublished(profile.isPublished);
      } catch (error) {
        if (!cancelled) {
          setFormError(mapApiError(error).message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextSlug = slug.trim().toLowerCase();
    if (nextSlug && !SLUG_RE.test(nextSlug)) {
      setSlugError(t('profile.slugInvalid'));
      return;
    }

    setBusy(true);
    setSlugError(undefined);
    setFormError(undefined);
    setSuccess(undefined);

    try {
      await getCoachingApi().updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        slug: nextSlug || undefined,
        credentials: credentials.trim(),
        isPublished,
      });
      setSuccess(t('profile.success'));
    } catch (error) {
      setFormError(mapApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page
      title={t('profile.title')}
      eyebrow={t('profile.eyebrow')}
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
      {loading ? <p>{t('common.loading')}</p> : null}
      {!loading ? (
        <form
          className="fp-profile-form"
          onSubmit={handleSubmit}
          data-testid="profile-editor-form"
        >
          <TextField
            label={t('profile.displayName')}
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            data-testid="profile-display-name"
          />
          <label className="fp-field" htmlFor="bio">
            <span className="fp-field__label">{t('profile.bio')}</span>
            <textarea
              id="bio"
              name="bio"
              className="fp-field__input fp-profile-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              data-testid="profile-bio"
            />
          </label>
          <TextField
            label={t('profile.slug')}
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={slugError}
            data-testid="profile-slug"
          />
          <TextField
            label={t('profile.credentials')}
            name="credentials"
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            data-testid="profile-credentials"
          />
          <label className="fp-profile-publish" data-testid="profile-publish">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            {t('profile.publish')}
          </label>
          {formError ? (
            <div data-testid="profile-error">
              <InlineError>{formError}</InlineError>
            </div>
          ) : null}
          {success ? (
            <p className="fp-profile-success" data-testid="profile-success">
              {success}
            </p>
          ) : null}
          <Button type="submit" disabled={busy} data-testid="profile-submit">
            {t('profile.submit')}
          </Button>
        </form>
      ) : null}
    </Page>
  );
}
