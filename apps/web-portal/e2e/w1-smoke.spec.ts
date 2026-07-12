import { expect, test } from '@playwright/test';

test.describe('Web portal W1 smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('login screen renders and locale switcher works', async ({ page }) => {
    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await expect(page.getByTestId('auth-email-input')).toBeVisible();
    await expect(page.getByTestId('locale-switcher')).toBeVisible();

    await page.getByTestId('locale-switcher').selectOption('en');
    await expect(page.getByTestId('auth-request-otp-button')).toHaveText(
      /Continue with email/i,
    );
  });

  test('dev mock login reaches onboarding or dashboard', async ({ page }) => {
    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await page.getByTestId('auth-dev-mock-login').click();

    await expect(
      page
        .getByTestId('onboarding-checkout')
        .or(page.getByTestId('dashboard-invite-cta'))
        .or(page.getByTestId('dashboard-empty')),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('email OTP path reaches OTP screen', async ({ page }) => {
    const email = `portal-e2e-${Date.now()}@example.com`;
    await page.getByTestId('auth-email-input').fill(email);
    await page.getByTestId('auth-request-otp-button').click();
    await expect(page.getByTestId('auth-otp-screen')).toBeVisible();
    await expect(page.getByTestId('auth-dev-otp-fill')).toBeVisible();
  });
});
