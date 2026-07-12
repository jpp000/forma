import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CoachingStudentRow } from '../../api/coaching';
import { useDashboardStore } from '../../stores/dashboardStore';
import {
  Button,
  DataTable,
  type DataTableColumn,
  InlineError,
  Page,
} from '../../ui';

const columns: DataTableColumn<CoachingStudentRow>[] = [
  {
    key: 'email',
    header: 'Student',
    render: (row) => row.email,
  },
  {
    key: 'lastWorkout',
    header: 'Last workout',
    render: (row) => row.lastWorkout ?? '—',
  },
  {
    key: 'lastMeal',
    header: 'Last meal',
    render: (row) => row.lastMeal ?? '—',
  },
  {
    key: 'weightTrend',
    header: 'Weight trend',
    render: (row) => row.weightTrend ?? '—',
  },
];

export function DashboardPage() {
  const students = useDashboardStore((s) => s.students);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const error = useDashboardStore((s) => s.error);
  const fetchDashboard = useDashboardStore((s) => s.fetch);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <Page
      title="Clients"
      eyebrow="Dashboard"
      actions={
        <Link to="/invites">
          <Button type="button" data-testid="dashboard-invite-cta">
            Invite student
          </Button>
        </Link>
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
              Retry
            </Button>
          }
        >
          {error}
        </InlineError>
      ) : null}

      {isLoading ? <p>Loading clients…</p> : null}

      {!isLoading && !error ? (
        <DataTable
          columns={columns}
          rows={students}
          rowKey={(row) => row.studentId}
          empty={
            <div data-testid="dashboard-empty">
              <p>No linked students yet.</p>
              <Link to="/invites">Invite a student by email</Link>
            </div>
          }
        />
      ) : null}
    </Page>
  );
}
