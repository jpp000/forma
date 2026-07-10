import { expect, test } from '@playwright/test';

test.describe('Mobile web smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('dev mock login opens authenticated shell', async ({ page }) => {
    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await page.getByTestId('auth-dev-mock-login').click();

    await expect(
      page
        .getByTestId('tab-home')
        .or(page.getByTestId('onboarding-profile-screen')),
    ).toBeVisible();
  });

  test('dev mock login can complete onboarding to tabs', async ({ page }) => {
    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await page.getByTestId('auth-dev-mock-login').click();

    await expect(
      page
        .getByTestId('onboarding-profile-screen')
        .or(page.getByTestId('tab-home')),
    ).toBeVisible();

    if (await page.getByTestId('onboarding-profile-screen').isVisible()) {
      await page.getByTestId('onboarding-age-input').fill('28');
      await page.getByTestId('onboarding-sex-male').click();
      await page.getByTestId('onboarding-height-input').fill('175');
      await page.getByTestId('onboarding-activity-moderate').click();
      await page.getByTestId('onboarding-profile-submit').click();
      await expect(page.getByTestId('onboarding-goal-screen')).toBeVisible();
    }

    if (await page.getByTestId('onboarding-goal-screen').isVisible()) {
      await page.getByTestId('onboarding-goal-lose_weight').click();
      await page.getByTestId('onboarding-goal-submit').click();
    }

    await expect(page.getByTestId('tab-home')).toBeVisible();
    await expect(page.getByTestId('tab-training')).toBeVisible();
    await expect(page.getByTestId('tab-nutrition')).toBeVisible();
    await expect(page.getByTestId('tab-progress')).toBeVisible();

    await page.getByTestId('tab-progress').click();
    await expect(page.getByTestId('progress-screen')).toBeVisible();
    await expect(page.getByTestId('progress-log-weight-button')).toBeVisible();
  });

  test('email OTP path reaches OTP screen', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;

    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await page.getByTestId('auth-email-input').fill(email);
    await page.getByTestId('auth-request-otp-button').click();

    await expect(page.getByTestId('auth-otp-screen')).toBeVisible();
    await expect(page.getByTestId('auth-dev-otp-fill')).toBeVisible();
  });
});
