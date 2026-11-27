import { Languages } from 'lucide-react';
import { useLang, type Lang } from '@/lib/i18n';

const LANGUAGES: { value: Lang; label: string }[] = [{ value: 'en', label: 'English' }, { value: 'ur', label: 'اردو' }];

/** Each button is written, and announced, in its own language. */
export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="ss-lang" role="group" aria-labelledby="lang-label">
      {/* The buttons show each language in its own script; the group name is for screen readers. */}
      <span id="lang-label" className="ss-sr">{t('lang.label')}</span>
      <Languages className="ss-lang-icon" aria-hidden />
      <span className="ss-lang-options">
        {LANGUAGES.map(l => (
          <button key={l.value} type="button" lang={l.value} aria-pressed={lang === l.value} onClick={() => setLang(l.value)}>{l.label}</button>
        ))}
      </span>
    </div>
  );
}
