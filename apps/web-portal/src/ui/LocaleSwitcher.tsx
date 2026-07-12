import { useLocale } from '../i18n';
import type { PortalLocale } from '../stores/localeStore';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="fp-locale">
      <span className="fp-locale__label">{t('locale.label')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as PortalLocale)}
        data-testid="locale-switcher"
      >
        <option value="pt-BR">{t('locale.ptBR')}</option>
        <option value="en">{t('locale.en')}</option>
      </select>
    </label>
  );
}
