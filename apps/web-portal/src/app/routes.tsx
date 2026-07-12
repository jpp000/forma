import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { isProfessionalRole } from '../api/errors';
import { LoginPage } from '../features/auth/LoginPage';
import { OAuthCallbackPage } from '../features/auth/OAuthCallbackPage';
import { OtpPage } from '../features/auth/OtpPage';
import { DashboardPlaceholder } from '../features/dashboard/DashboardPlaceholder';
import { InvitesPlaceholder } from '../features/invites/InvitesPlaceholder';
import { OnboardingPlaceholder } from '../features/onboarding/OnboardingPlaceholder';
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
              <OnboardingPlaceholder />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <RequireProfessional>
                <DashboardPlaceholder />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route
          path="/invites"
          element={
            <RequireAuth>
              <RequireProfessional>
                <InvitesPlaceholder />
              </RequireProfessional>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
