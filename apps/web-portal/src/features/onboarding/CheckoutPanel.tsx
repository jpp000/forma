import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mapApiError } from '../../api/errors';
import { getBillingApi } from '../../api/wire';
import { Button, InlineError } from '../../ui';
import './onboarding.css';

export function CheckoutPanel() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleCheckout() {
    setBusy(true);
    setError(undefined);
    try {
      const { url } = await getBillingApi().checkoutProfessional();
      window.location.assign(url);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="fp-onboarding-panel" data-testid="onboarding-checkout">
      <h2>Subscribe as a professional</h2>
      <p>
        A paid professional plan is required before creating a trainer or
        nutritionist profile.
      </p>
      {error ? <InlineError>{error}</InlineError> : null}
      <div className="fp-onboarding-actions">
        <Button
          type="button"
          disabled={busy}
          onClick={() => void handleCheckout()}
          data-testid="onboarding-checkout-button"
        >
          Continue to checkout
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate('/')}>
          I already subscribed
        </Button>
      </div>
    </section>
  );
}
