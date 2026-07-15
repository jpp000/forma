import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LinkRequestRow } from '../../api/coaching';
import { mapApiError } from '../../api/errors';
import { getCoachingApi } from '../../api/wire';
import { useT } from '../../i18n';
import {
  Button,
  DataTable,
  type DataTableColumn,
  InlineError,
  LocaleSwitcher,
  Page,
} from '../../ui';
import './requests.css';

export function RequestsInboxPage() {
  const t = useT();
  const [requests, setRequests] = useState<LinkRequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [busyId, setBusyId] = useState<string>();

  async function load() {
    setIsLoading(true);
    setError(undefined);
    try {
      const res = await getCoachingApi().listLinkRequests();
      setRequests(res.requests);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only load
  useEffect(() => {
    void load();
  }, []);

  async function resolve(id: string, action: 'accept' | 'decline') {
    setBusyId(id);
    setError(undefined);
    try {
      const api = getCoachingApi();
      if (action === 'accept') {
        await api.acceptLinkRequest(id);
      } else {
        await api.declineLinkRequest(id);
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusyId(undefined);
    }
  }

  const columns: DataTableColumn<LinkRequestRow>[] = [
    {
      key: 'student',
      header: t('requests.colStudent'),
      render: (row) => row.studentEmail,
    },
    {
      key: 'created',
      header: t('requests.colCreated'),
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="fp-request-actions">
          <Button
            type="button"
            disabled={busyId === row.id}
            onClick={() => void resolve(row.id, 'accept')}
            data-testid={`request-accept-${row.id}`}
          >
            {t('requests.accept')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busyId === row.id}
            onClick={() => void resolve(row.id, 'decline')}
            data-testid={`request-decline-${row.id}`}
          >
            {t('requests.decline')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Page
      title={t('requests.title')}
      eyebrow={t('requests.eyebrow')}
      actions={
        <>
          <LocaleSwitcher />
          <Link to="/">
            <Button type="button" variant="ghost">
              {t('common.backDashboard')}
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
              onClick={() => void load()}
              data-testid="requests-retry"
            >
              {t('common.retry')}
            </Button>
          }
        >
          {error}
        </InlineError>
      ) : null}

      {isLoading ? <p>{t('requests.loading')}</p> : null}

      {!isLoading && !error ? (
        <DataTable
          columns={columns}
          rows={requests}
          rowKey={(row) => row.id}
          empty={
            <div data-testid="requests-empty">
              <p>{t('requests.empty')}</p>
            </div>
          }
        />
      ) : null}
    </Page>
  );
}
