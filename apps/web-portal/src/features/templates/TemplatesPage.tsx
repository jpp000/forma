import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CoachingStudentRow } from '../../api/coaching';
import { mapApiError } from '../../api/errors';
import type { WorkoutTemplate } from '../../api/training';
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
import './templates.css';

const defaultItem = {
  name: '',
  muscleGroup: '',
  equipment: '',
  sets: 3,
  reps: 10,
  restSeconds: 60,
};

export function TemplatesPage() {
  const t = useT();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [students, setStudents] = useState<CoachingStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [restSeconds, setRestSeconds] = useState('60');

  const [prescribeTemplateId, setPrescribeTemplateId] = useState('');
  const [prescribeStudentId, setPrescribeStudentId] = useState('');

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const [tpl, dash] = await Promise.all([
        getTrainingApi().listTemplates(),
        getCoachingApi().getDashboard(),
      ]);
      setTemplates(tpl.templates);
      setStudents(dash.students);
      if (!prescribeTemplateId && tpl.templates[0]) {
        setPrescribeTemplateId(tpl.templates[0].id);
      }
      if (!prescribeStudentId && dash.students[0]) {
        setPrescribeStudentId(dash.students[0].studentId);
      }
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only load
  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const item = {
      ...defaultItem,
      name: exerciseName.trim(),
      muscleGroup: muscleGroup.trim(),
      equipment: equipment.trim(),
      sets: Number(sets),
      reps: Number(reps),
      restSeconds: Number(restSeconds),
    };
    if (!trimmedName || !item.name || !item.muscleGroup || !item.equipment) {
      setError(t('templates.validation'));
      return;
    }

    setBusy(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      await getTrainingApi().createTemplate({
        name: trimmedName,
        items: [item],
      });
      setSuccess(t('templates.createSuccess'));
      setName('');
      setExerciseName('');
      setMuscleGroup('');
      setEquipment('');
      await load();
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePrescribe(event: React.FormEvent) {
    event.preventDefault();
    if (!prescribeTemplateId || !prescribeStudentId) {
      setError(t('templates.prescribeValidation'));
      return;
    }
    setBusy(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      await getTrainingApi().prescribePlan({
        studentUserId: prescribeStudentId,
        templateId: prescribeTemplateId,
      });
      setSuccess(t('templates.prescribeSuccess'));
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  const columns: DataTableColumn<WorkoutTemplate>[] = [
    {
      key: 'name',
      header: t('templates.colName'),
      render: (row) => row.name,
    },
    {
      key: 'items',
      header: t('templates.colExercises'),
      render: (row) => String(row.items?.length ?? 0),
    },
  ];

  return (
    <Page
      title={t('templates.title')}
      eyebrow={t('templates.eyebrow')}
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
        <p className="fp-templates-success" data-testid="templates-success">
          {success}
        </p>
      ) : null}

      {loading ? <p>{t('common.loading')}</p> : null}

      {!loading ? (
        <>
          <DataTable
            columns={columns}
            rows={templates}
            rowKey={(row) => row.id}
            empty={
              <div data-testid="templates-empty">
                <p>{t('templates.empty')}</p>
              </div>
            }
          />

          <form
            className="fp-templates-form"
            onSubmit={handleCreate}
            data-testid="templates-create-form"
          >
            <h2>{t('templates.createTitle')}</h2>
            <TextField
              label={t('templates.name')}
              name="templateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="templates-name"
            />
            <TextField
              label={t('templates.exerciseName')}
              name="exerciseName"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              data-testid="templates-exercise-name"
            />
            <TextField
              label={t('templates.muscleGroup')}
              name="muscleGroup"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
            />
            <TextField
              label={t('templates.equipment')}
              name="equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            />
            <div className="fp-templates-row">
              <TextField
                label={t('templates.sets')}
                name="sets"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
              />
              <TextField
                label={t('templates.reps')}
                name="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
              <TextField
                label={t('templates.rest')}
                name="rest"
                value={restSeconds}
                onChange={(e) => setRestSeconds(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              data-testid="templates-create"
            >
              {t('templates.createSubmit')}
            </Button>
          </form>

          <form
            className="fp-templates-form"
            onSubmit={handlePrescribe}
            data-testid="templates-prescribe-form"
          >
            <h2>{t('templates.prescribeTitle')}</h2>
            <label className="fp-field" htmlFor="prescribe-template">
              <span className="fp-field__label">
                {t('templates.pickTemplate')}
              </span>
              <select
                id="prescribe-template"
                className="fp-field__input"
                value={prescribeTemplateId}
                onChange={(e) => setPrescribeTemplateId(e.target.value)}
                data-testid="templates-pick-template"
              >
                <option value="">
                  {t('templates.pickTemplatePlaceholder')}
                </option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="fp-field" htmlFor="prescribe-student">
              <span className="fp-field__label">
                {t('templates.pickStudent')}
              </span>
              <select
                id="prescribe-student"
                className="fp-field__input"
                value={prescribeStudentId}
                onChange={(e) => setPrescribeStudentId(e.target.value)}
                data-testid="templates-pick-student"
              >
                <option value="">
                  {t('templates.pickStudentPlaceholder')}
                </option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.email}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="submit"
              disabled={busy}
              data-testid="templates-prescribe"
            >
              {t('templates.prescribeSubmit')}
            </Button>
          </form>
        </>
      ) : null}
    </Page>
  );
}
