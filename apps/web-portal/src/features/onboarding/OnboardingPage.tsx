import { Page } from '../../ui';
import { CheckoutPanel } from './CheckoutPanel';
import { ProfileForm } from './ProfileForm';

export function OnboardingPage() {
  return (
    <Page title="Become a professional" eyebrow="Onboarding">
      <CheckoutPanel />
      <ProfileForm />
    </Page>
  );
}
