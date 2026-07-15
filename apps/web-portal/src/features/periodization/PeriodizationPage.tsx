import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CoachingStudentRow } from '../../api/coaching';
import { mapApiError } from '../../api/errors';
import type { Periodization, WorkoutTemplate } from '../../api/training';
import { getCoachingApi, getTrainingApi } from '../../api/wire';
import { useT } from '../../i18n';
import {
  Button,
  DataTable,
  type DataTableColumn,
  InlineError,
  LocaleSwitcher,
  Page,
  TextField,
} from '../../ui';
import '../templates/templates.css';

export function PeriodizationPage() {
  const t = useT();
  const [periodizations, setPeriodizations] = useState<Periodization[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [students, setStudents] = useState<CoachingStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [block1, setBlock1] = useState('');
  const [block2, setBlock2] = useState('');
  const [days, setDays] = useState('7');
  const [periodizationId, setPeriodizationId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [lastAssignmentId, setLastAssignmentId] = useState('');

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const [per, tpl, dash] = await Promise.all([
        getTrainingApi().listPeriodizations(),
        getTrainingApi().listTemplates(),
        getCoachingApi().getDashboard(),
      ]);
      setPeriodizations(per.periodizations);
      setTemplates(tpl.templates);
      setStudents(dash.students);
      if (!periodizationId && per.periodizations[0]) {
        setPeriodizationId(per.periodizations[0].id);
      }
      if (!studentId && dash.students[0]) {
        setStudentId(dash.students[0].studentId);
      }
      if (!block1 && tpl.templates[0]) setBlock1(tpl.templates[0].id);
      if (!block2 && tpl.templates[1]) setBlock2(tpl.templates[1].id);
      else if (!block2 && tpl.templates[0]) setBlock2(tpl.templates[0].id);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !block1 || !block2) {
      setError(t('periodization.validation'));
      return;
    }
    setBusy(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      await getTrainingApi().createPeriodization({
        name: name.trim(),
        blocks: [
          { templateId: block1, durationDays: Number(days) || 7 },
          { templateId: block2, durationDays: Number(days) || 7 },
        ],
      });
      setSuccess(t('periodization.createSuccess'));
      setName('');
      await load();
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign(event: React.FormEvent) {
    event.preventDefault();
    if (!periodizationId || !studentId) {
      setError(t('periodization.assignValidation'));
      return;
    }
    setBusy(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      const res = await getTrainingApi().assignPeriodization(periodizationId, {
        studentUserId: studentId,
      });
      setLastAssignmentId(res.assignment.id);
      setSuccess(t('periodization.assignSuccess'));
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAdvance() {
    if (!lastAssignmentId) {
      setError(t('periodization.advanceValidation'));
      return;
    }
    setBusy(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      await getTrainingApi().advanceAssignment(lastAssignmentId);
      setSuccess(t('periodization.advanceSuccess'));
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  const columns: DataTableColumn<Periodization>[] = [
    {
      key: 'name',
      header: t('periodization.colName'),
      render: (row) => row.name,
    },
    {
      key: 'blocks',
      header: t('periodization.colBlocks'),
      render: (row) => String(row.blocks.length),
    },
  ];

  return (
    <Page
      title={t('periodization.title')}
      eyebrow={t('periodization.eyebrow')}
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
      {error ? <InlineError>{error}</InlineError> : null}
      {success ? (
        <p className="fp-templates-success" data-testid="periodization-success">
          {success}
        </p>
      ) : null}
      {loading ? <p>{t('common.loading')}</p> : null}
      {!loading ? (
        <>
          <DataTable
            columns={columns}
            rows={periodizations}
            rowKey={(row) => row.id}
            empty={
              <div data-testid="periodization-empty">
                <p>{t('periodization.empty')}</p>
              </div>
            }
          />
          <form
            className="fp-templates-form"
            onSubmit={handleCreate}
            data-testid="periodization-create"
          >
            <h2>{t('periodization.createTitle')}</h2>
            <TextField
              label={t('periodization.name')}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="fp-field" htmlFor="b1">
              <span className="fp-field__label">{t('periodization.block1')}</span>
              <select
                id="b1"
                className="fp-field__input"
                value={block1}
                onChange={(e) => setBlock1(e.target.value)}
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="fp-field" htmlFor="b2">
              <span className="fp-field__label">{t('periodization.block2')}</span>
              <select
                id="b2"
                className="fp-field__input"
                value={block2}
                onChange={(e) => setBlock2(e.target.value)}
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label={t('periodization.durationDays')}
              name="days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            <Button type="submit" disabled={busy}>
              {t('periodization.createSubmit')}
            </Button>
          </form>
          <form
            className="fp-templates-form"
            onSubmit={handleAssign}
            data-testid="periodization-assign"
          >
            <h2>{t('periodization.assignTitle')}</h2>
            <label className="fp-field" htmlFor="per">
              <span className="fp-field__label">
                {t('periodization.pickPeriodization')}
              </span>
              <select
                id="per"
                className="fp-field__input"
                value={periodizationId}
                onChange={(e) => setPeriodizationId(e.target.value)}
              >
                {periodizations.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="fp-field" htmlFor="stu">
              <span className="fp-field__label">
                {t('periodization.pickStudent')}
              </span>
              <select
                id="stu"
                className="fp-field__input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.email}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={busy}>
              {t('periodization.assignSubmit')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy || !lastAssignmentId}
              onClick={() => void handleAdvance()}
              data-testid="periodization-advance"
            >
              {t('periodization.advanceSubmit')}
            </Button>
          </form>
        </>
      ) : null}
    </Page>
  );
}
