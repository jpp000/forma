import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CoachingStudentRow } from '../../api/coaching';
import { mapApiError } from '../../api/errors';
import type { NutritionTemplate } from '../../api/nutrition';
import { getCoachingApi, getNutritionApi } from '../../api/wire';
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

export function NutritionTemplatesPage() {
  const t = useT();
  const [templates, setTemplates] = useState<NutritionTemplate[]>([]);
  const [students, setStudents] = useState<CoachingStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('200');
  const [fat, setFat] = useState('65');
  const [templateId, setTemplateId] = useState('');
  const [studentId, setStudentId] = useState('');

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const [tpl, dash] = await Promise.all([
        getNutritionApi().listTemplates(),
        getCoachingApi().getDashboard(),
      ]);
      setTemplates(tpl.templates);
      setStudents(dash.students);
      if (!templateId && tpl.templates[0]) setTemplateId(tpl.templates[0].id);
      if (!studentId && dash.students[0])
        setStudentId(dash.students[0].studentId);
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
    if (!name.trim()) {
      setError(t('nutritionTemplates.validation'));
      return;
    }
    setBusy(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      await getNutritionApi().createTemplate({
        name: name.trim(),
        dailyCalories: Number(calories),
        dailyProtein: Number(protein),
        dailyCarbs: Number(carbs),
        dailyFat: Number(fat),
      });
      setSuccess(t('nutritionTemplates.createSuccess'));
      setName('');
      await load();
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePrescribe(event: React.FormEvent) {
    event.preventDefault();
    if (!templateId || !studentId) {
      setError(t('nutritionTemplates.prescribeValidation'));
      return;
    }
    setBusy(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      await getNutritionApi().prescribePlan({
        studentUserId: studentId,
        templateId,
      });
      setSuccess(t('nutritionTemplates.prescribeSuccess'));
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  const columns: DataTableColumn<NutritionTemplate>[] = [
    {
      key: 'name',
      header: t('nutritionTemplates.colName'),
      render: (row) => row.name,
    },
    {
      key: 'macros',
      header: t('nutritionTemplates.colMacros'),
      render: (row) =>
        `${row.dailyCalories} kcal · P${row.dailyProtein} C${row.dailyCarbs} F${row.dailyFat}`,
    },
  ];

  return (
    <Page
      title={t('nutritionTemplates.title')}
      eyebrow={t('nutritionTemplates.eyebrow')}
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
        <p className="fp-templates-success" data-testid="nutrition-templates-success">
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
              <div data-testid="nutrition-templates-empty">
                <p>{t('nutritionTemplates.empty')}</p>
              </div>
            }
          />
          <form
            className="fp-templates-form"
            onSubmit={handleCreate}
            data-testid="nutrition-templates-create"
          >
            <h2>{t('nutritionTemplates.createTitle')}</h2>
            <TextField
              label={t('nutritionTemplates.name')}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="fp-templates-row">
              <TextField
                label={t('nutritionTemplates.calories')}
                name="cal"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
              <TextField
                label={t('nutritionTemplates.protein')}
                name="pro"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
              <TextField
                label={t('nutritionTemplates.carbs')}
                name="carb"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
              <TextField
                label={t('nutritionTemplates.fat')}
                name="fat"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy}>
              {t('nutritionTemplates.createSubmit')}
            </Button>
          </form>
          <form
            className="fp-templates-form"
            onSubmit={handlePrescribe}
            data-testid="nutrition-templates-prescribe"
          >
            <h2>{t('nutritionTemplates.prescribeTitle')}</h2>
            <label className="fp-field" htmlFor="nt-tpl">
              <span className="fp-field__label">
                {t('nutritionTemplates.pickTemplate')}
              </span>
              <select
                id="nt-tpl"
                className="fp-field__input"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">
                  {t('nutritionTemplates.pickTemplatePlaceholder')}
                </option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="fp-field" htmlFor="nt-stu">
              <span className="fp-field__label">
                {t('nutritionTemplates.pickStudent')}
              </span>
              <select
                id="nt-stu"
                className="fp-field__input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">
                  {t('nutritionTemplates.pickStudentPlaceholder')}
                </option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.email}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={busy}>
              {t('nutritionTemplates.prescribeSubmit')}
            </Button>
          </form>
        </>
      ) : null}
    </Page>
  );
}
