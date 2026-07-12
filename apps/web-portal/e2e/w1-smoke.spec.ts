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

  test('dev mock login stores Bearer token and reaches gated shell', async ({
    page,
  }) => {
    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await page.getByTestId('auth-dev-mock-login').click();

    await expect(
      page
        .getByTestId('onboarding-checkout')
        .or(page.getByTestId('dashboard-invite-cta'))
        .or(page.getByTestId('dashboard-empty')),
    ).toBeVisible({ timeout: 30_000 });

    const token = await page.evaluate(() =>
      localStorage.getItem('forma.portal.accessToken'),
    );
    expect(token).toBeTruthy();
  });

  test('new user OTP login lands on professional onboarding', async ({
    page,
  }) => {
    const email = `portal-e2e-${Date.now()}@example.com`;
    await page.getByTestId('auth-email-input').fill(email);
    await page.getByTestId('auth-request-otp-button').click();
    await expect(page.getByTestId('auth-otp-screen')).toBeVisible();
    await page.getByTestId('auth-dev-otp-fill').click();
    await page.getByTestId('auth-otp-submit-button').click();
    await expect(page.getByTestId('onboarding-checkout')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('onboarding-profile-form')).toBeVisible();
  });

  test('email OTP path reaches OTP screen', async ({ page }) => {
    const email = `portal-e2e-otp-${Date.now()}@example.com`;
    await page.getByTestId('auth-email-input').fill(email);
    await page.getByTestId('auth-request-otp-button').click();
    await expect(page.getByTestId('auth-otp-screen')).toBeVisible();
    await expect(page.getByTestId('auth-dev-otp-fill')).toBeVisible();
  });
});

test.describe('Web portal W1 workplace (mocked API)', () => {
  test('dashboard empty CTA and invite success show 7-day hint', async ({
    page,
  }) => {
    await page.route('**/api/identity/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pro-1',
          email: 'pro@example.com',
          roles: ['trainer'],
        }),
      });
    });
    await page.route('**/api/coaching/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ students: [] }),
      });
    });
    await page.route('**/api/coaching/invites', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'invite-token',
            expiresAt: new Date().toISOString(),
            studentEmail: 'student@example.com',
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.addInitScript(() => {
      localStorage.setItem('forma.portal.accessToken', 'test-token');
    });

    await page.goto('/');
    await expect(page.getByTestId('dashboard-empty')).toBeVisible();
    await expect(
      page.getByTestId('dashboard-empty').getByRole('link'),
    ).toHaveAttribute('href', '/invites');

    await page.goto('/invites');
    await page.getByTestId('locale-switcher').selectOption('en');
    await page.getByTestId('invite-email-input').fill('student@example.com');
    await page.getByTestId('invite-submit').click();
    await expect(page.getByTestId('invite-success')).toContainText(/7 days/i);
  });

  test('dashboard error shows retry control', async ({ page }) => {
    await page.route('**/api/identity/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pro-1',
          email: 'pro@example.com',
          roles: ['trainer'],
        }),
      });
    });
    await page.route('**/api/coaching/dashboard', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'boom' }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('forma.portal.accessToken', 'test-token');
    });

    await page.goto('/');
    await expect(page.getByTestId('dashboard-retry')).toBeVisible();
  });

  test('profile 402 surfaces checkout paywall', async ({ page }) => {
    await page.route('**/api/identity/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-1',
          email: 'user@example.com',
          roles: [],
        }),
      });
    });
    await page.route('**/api/coaching/profile', async (route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Upgrade required' }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('forma.portal.accessToken', 'test-token');
    });

    await page.goto('/onboarding');
    await page.getByTestId('onboarding-credentials-input').fill('CREF 123');
    await page.getByTestId('onboarding-profile-submit').click();
    await expect(page.getByTestId('onboarding-checkout')).toBeVisible();
  });

  test('dashboard renders linked students with activity summary fields', async ({
    page,
  }) => {
    await page.route('**/api/identity/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pro-1',
          email: 'pro@example.com',
          roles: ['trainer'],
        }),
      });
    });
    await page.route('**/api/coaching/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          students: [
            {
              studentId: 'stu-1',
              email: 'aluno@example.com',
              lastWorkout: '2026-07-10',
              lastMeal: '2026-07-11',
              weightTrend: 'down',
            },
          ],
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('forma.portal.accessToken', 'test-token');
    });

    await page.goto('/');
    await expect(page.getByText('aluno@example.com')).toBeVisible();
    await expect(page.getByText('2026-07-10')).toBeVisible();
    await expect(page.getByText('2026-07-11')).toBeVisible();
    await expect(page.getByText('down')).toBeVisible();
  });

  test('invite API validation error is shown on the form', async ({ page }) => {
    await page.route('**/api/identity/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pro-1',
          email: 'pro@example.com',
          roles: ['trainer'],
        }),
      });
    });
    await page.route('**/api/coaching/invites', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Must be a valid email address' }),
        });
        return;
      }
      await route.continue();
    });

    await page.addInitScript(() => {
      localStorage.setItem('forma.portal.accessToken', 'test-token');
    });

    await page.goto('/invites');
    await page.getByTestId('invite-email-input').fill('student@example.com');
    await page.getByTestId('invite-submit').click();
    await expect(page.getByRole('alert')).toContainText(
      /valid email|e-mail válido|Must be a valid/i,
    );
  });
});
