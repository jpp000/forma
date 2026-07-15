import { useT } from '../../i18n';
import { LocaleSwitcher, Page } from '../../ui';
import { CheckoutPanel } from './CheckoutPanel';
import { ProfileForm } from './ProfileForm';

export function OnboardingPage() {
  const t = useT();
  return (
    <Page
      title={t('onboarding.title')}
      eyebrow={t('onboarding.eyebrow')}
      actions={<LocaleSwitcher />}
    >
      <CheckoutPanel />
      <ProfileForm />
    </Page>
  );
}
