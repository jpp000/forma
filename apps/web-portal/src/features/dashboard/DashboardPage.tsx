import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CoachingStudentRow } from '../../api/coaching';
import { useT } from '../../i18n';
import { useDashboardStore } from '../../stores/dashboardStore';
import {
  Button,
  DataTable,
  type DataTableColumn,
  InlineError,
  LocaleSwitcher,
  Page,
} from '../../ui';

export function DashboardPage() {
  const t = useT();
  const students = useDashboardStore((s) => s.students);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const error = useDashboardStore((s) => s.error);
  const fetchDashboard = useDashboardStore((s) => s.fetch);

  const columns: DataTableColumn<CoachingStudentRow>[] = [
    {
      key: 'email',
      header: t('dashboard.colStudent'),
      render: (row) => row.email,
    },
    {
      key: 'lastWorkout',
      header: t('dashboard.colLastWorkout'),
      render: (row) => row.lastWorkout ?? '—',
    },
    {
      key: 'lastMeal',
      header: t('dashboard.colLastMeal'),
      render: (row) => row.lastMeal ?? '—',
    },
    {
      key: 'weightTrend',
      header: t('dashboard.colWeightTrend'),
      render: (row) => row.weightTrend ?? '—',
    },
  ];

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <Page
      title={t('dashboard.title')}
      eyebrow={t('dashboard.eyebrow')}
      actions={
        <>
          <LocaleSwitcher />
          <Link to="/profile">
            <Button
              type="button"
              variant="ghost"
              data-testid="dashboard-profile-cta"
            >
              {t('dashboard.profileCta')}
            </Button>
          </Link>
          <Link to="/requests">
            <Button
              type="button"
              variant="ghost"
              data-testid="dashboard-requests-cta"
            >
              {t('dashboard.requestsCta')}
            </Button>
          </Link>
          <Link to="/templates">
            <Button
              type="button"
              variant="ghost"
              data-testid="dashboard-templates-cta"
            >
              {t('dashboard.templatesCta')}
            </Button>
          </Link>
          <Link to="/nutrition-templates">
            <Button
              type="button"
              variant="ghost"
              data-testid="dashboard-nutrition-templates-cta"
            >
              {t('dashboard.nutritionTemplatesCta')}
            </Button>
          </Link>
          <Link to="/periodization">
            <Button
              type="button"
              variant="ghost"
              data-testid="dashboard-periodization-cta"
            >
              {t('dashboard.periodizationCta')}
            </Button>
          </Link>
          <Link to="/invites">
            <Button type="button" data-testid="dashboard-invite-cta">
              {t('dashboard.inviteCta')}
            </Button>
          </Link>
        </>
      }
    >
      {error ? (
        <InlineError
          action={
            <Button
              type="button"
              variant="ghost"
              onClick={() => void fetchDashboard()}
              data-testid="dashboard-retry"
            >
              {t('common.retry')}
            </Button>
          }
        >
          {error}
        </InlineError>
      ) : null}

      {isLoading ? <p>{t('dashboard.loading')}</p> : null}

      {!isLoading && !error ? (
        <DataTable
          columns={columns}
          rows={students}
          rowKey={(row) => row.studentId}
          empty={
            <div data-testid="dashboard-empty">
              <p>{t('dashboard.empty')}</p>
              <Link to="/invites">{t('dashboard.emptyCta')}</Link>
            </div>
          }
        />
      ) : null}
    </Page>
  );
}
