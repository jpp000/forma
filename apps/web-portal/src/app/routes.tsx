import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { isProfessionalRole } from '../api/errors';
import { LoginPage } from '../features/auth/LoginPage';
import { OAuthCallbackPage } from '../features/auth/OAuthCallbackPage';
import { OtpPage } from '../features/auth/OtpPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { InvitesPage } from '../features/invites/InvitesPage';
import { NutritionTemplatesPage } from '../features/nutrition/NutritionTemplatesPage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { PeriodizationPage } from '../features/periodization/PeriodizationPage';
import { ProfileEditorPage } from '../features/profile/ProfileEditorPage';
import { RequestsInboxPage } from '../features/requests/RequestsInboxPage';
import { TemplatesPage } from '../features/templates/TemplatesPage';
import { useSessionStore } from '../stores/sessionStore';

function BootstrapShell() {
  const bootstrap = useSessionStore((s) => s.bootstrap);
  const isLoading = useSessionStore((s) => s.isLoading);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (isLoading) {
    return (
      <main className="fp-page">
        <p>Loading…</p>
      </main>
    );
  }

  return <Outlet />;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useSessionStore((s) => s.token);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function RequireProfessional({ children }: { children: React.ReactNode }) {
  const user = useSessionStore((s) => s.user);
  if (!isProfessionalRole(user?.roles)) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function RedirectAuthedAwayFromLogin({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useSessionStore((s) => s.token);
  const user = useSessionStore((s) => s.user);
  if (token) {
    return (
      <Navigate
        to={isProfessionalRole(user?.roles) ? '/' : '/onboarding'}
        replace
      />
    );
  }
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<BootstrapShell />}>
        <Route
          path="/login"
          element={
            <RedirectAuthedAwayFromLogin>
              <LoginPage />
            </RedirectAuthedAwayFromLogin>
          }
        />
        <Route
          path="/login/otp"
          element={
            <RedirectAuthedAwayFromLogin>
              <OtpPage />
            </RedirectAuthedAwayFromLogin>
          }
        />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <RequireProfessional>
                <DashboardPage />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route
          path="/invites"
          element={
            <RequireAuth>
              <RequireProfessional>
                <InvitesPage />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <RequireProfessional>
                <ProfileEditorPage />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route
          path="/requests"
          element={
            <RequireAuth>
              <RequireProfessional>
                <RequestsInboxPage />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route
          path="/templates"
          element={
            <RequireAuth>
              <RequireProfessional>
                <TemplatesPage />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route
          path="/nutrition-templates"
          element={
            <RequireAuth>
              <RequireProfessional>
                <NutritionTemplatesPage />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route
          path="/periodization"
          element={
            <RequireAuth>
              <RequireProfessional>
                <PeriodizationPage />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
