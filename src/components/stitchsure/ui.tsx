import { forwardRef, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronRight, CircleAlert, Clock3, Layers, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STEPS } from '@/lib/status';
import { useLang, type Key, type Msg } from '@/lib/i18n';

export type Status =
  | 'Approved' | 'Pending' | 'Rejected' | 'Superseded' | 'Cancelled' | 'Can be made' | 'Cannot be made' | 'Declined' | 'Finished'
  | 'Waiting for you' | 'Waiting for the tailor' | 'Waiting for the customer' | 'Agreed';

/** Status is always words plus an icon, never colour alone. */
const OK: Status[] = ['Approved', 'Can be made', 'Finished', 'Agreed'];
const BAD: Status[] = ['Rejected', 'Cannot be made', 'Declined', 'Cancelled'];
export function Chip({ status, version }: { status: Status; version?: number }) {
  const { t } = useLang();
  const tone = OK.includes(status) ? 'ok' : BAD.includes(status) ? 'bad' : status === 'Superseded' ? 'off' : 'wait';
  const Icon = tone === 'ok' ? Check : tone === 'bad' ? X : tone === 'off' ? Layers : Clock3;
  return <span className={cn('ss-chip', `ss-chip-${tone}`)}><Icon aria-hidden />{t(`status.${status}` as Key)}{version ? <small>{t('version.n', { version })}</small> : null}</span>;
}

export function Avatar({ initials }: { initials: string }) {
  return <span className="ss-avatar" aria-hidden>{initials}</span>;
}

/** How much of a long note shows before "Show more" (D5A M-25). */
const PREVIEW = 100;
export function LongText({ text }: { text: string }) {
  const { t } = useLang();
  const [all, setAll] = useState(false);
  if (text.length <= PREVIEW) return <bdi>{text}</bdi>;
  return (
    <>
      <bdi>{all ? text : `${text.slice(0, PREVIEW).trimEnd()}…`}</bdi>{' '}
      <button type="button" className="ss-more" aria-expanded={all} onClick={() => setAll(v => !v)}>{t(all ? 'text.less' : 'text.more')}</button>
    </>
  );
}

/** First stop on every page: jumps past the bars to the task (D5A M-16). */
export function SkipLink() {
  const { t } = useLang();
  return <a className="ss-skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('skip')}</a>;
}

/** Marks a heading as the place focus moves to after a screen change (D5A S-04). */
export const focusProps = (on: boolean | undefined) => (on ? { tabIndex: -1, 'data-focus-target': true } : {});

/** A bordered group: one idea per card (common region). */
export function Card({ title, aside, children, className, focusTarget }: { title: string; aside?: ReactNode; children: ReactNode; className?: string; /** This card's heading receives focus after a screen change. */ focusTarget?: boolean }) {
  const hid = useId();
  return (
    <section className={cn('ss-card', className)} aria-labelledby={hid}>
      <header className="ss-card-head">
        <h2 id={hid} {...focusProps(focusTarget)}>{title}</h2>
        {aside && <div className="ss-card-aside">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/** Progressive disclosure: a button that shows or hides extra detail. */
export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="ss-disclosure">
      <Button variant="link" className="ss-link" aria-expanded={open} aria-controls={id} onClick={() => setOpen(v => !v)}><ChevronRight className={open ? 'rotate-90' : 'ss-flip'} aria-hidden />{label}</Button>
      <div id={id} className="ss-disclosure-body" hidden={!open}>{open && children}</div>
    </div>
  );
}

/** The undo promised at approval, shown wherever the customer lands until stitching starts (D5A M-03). */
export function UndoNotice({ onUndo, disabled }: { onUndo: () => void; disabled?: boolean | undefined }) {
  const { t } = useLang();
  return (
    <div className="ss-undo">
      <p>{t('undo.text')}</p>
      <Button variant="outline" disabled={disabled} onClick={onUndo}><Undo2 className="ss-flip" aria-hidden />{t('undo.button')}</Button>
    </div>
  );
}

export function Facts({ rows, label }: { rows: { label: string; value: ReactNode; flag?: string | undefined }[]; label?: string }) {
  return (
    <dl className="ss-facts" aria-label={label}>
      {rows.map(r => (
        <div key={r.label} className={cn('ss-fact', r.flag && 'ss-fact-flag')}>
          <dt>{r.label}</dt>
          <dd>{r.value}{r.flag && <span className="ss-flag">{r.flag}</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string | undefined; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="ss-field">
      <label htmlFor={htmlFor} className="ss-label">{label}</label>
      {children}
      {hint && <p className="ss-hint">{hint}</p>}
    </div>
  );
}

type Opt<T extends string> = { value: T; label: string; hint?: string | undefined };

/** Segmented control built on native radios: arrow keys, labels and state come free. */
export function Segmented<T extends string>({ legend, value, options, onChange, disabled, className }: { legend: string; value: T | ''; options: Opt<T>[]; onChange: (v: T) => void; disabled?: boolean | undefined; className?: string }) {
  const name = useId();
  return (
    <fieldset className={cn('ss-seg', className)} disabled={disabled}>
      <legend className="ss-label">{legend}</legend>
      <div className="ss-seg-track">
        {options.map(o => (
          <label key={o.value} className={cn('ss-seg-item', value === o.value && 'is-on')}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="ss-sr" />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Grouped list of radio rows, each with an optional one-line description (recognition over recall). */
export function OptionList<T extends string>({ legend, hideLegend, value, options, onChange, disabled }: { legend: string; hideLegend?: boolean; value: T | ''; options: Opt<T>[]; onChange: (v: T) => void; disabled?: boolean | undefined }) {
  const name = useId();
  return (
    <fieldset className="ss-options" disabled={disabled}>
      <legend className={cn('ss-label', hideLegend && 'ss-sr')}>{legend}</legend>
      <div className="ss-options-list">
        {options.map(o => (
          <label key={o.value} className={cn('ss-option', value === o.value && 'is-on')}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="ss-sr" />
            <span className="ss-option-text"><strong>{o.label}</strong>{o.hint && <small>{o.hint}</small>}</span>
            <span className="ss-option-check" aria-hidden><Check /></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export const Notice = forwardRef<HTMLDivElement, { tone: 'info' | 'ok' | 'bad'; children: ReactNode; role?: 'alert' | 'status' }>(function Notice({ tone, children, role }, ref) {
  const Icon = tone === 'bad' ? CircleAlert : tone === 'ok' ? Check : Clock3;
  return <div ref={ref} tabIndex={tone === 'bad' ? -1 : undefined} role={role} className={cn('ss-notice', `ss-notice-${tone}`)}><Icon aria-hidden /><span>{children}</span></div>;
});

export function StepRail({ active }: { active: number }) {
  const { t } = useLang();
  return (
    <div className="ss-rail-wrap">
      <p className="ss-rail-label" id="rail-label">{t('rail.label')}{active < 0 && <span>{t('rail.none')}</span>}</p>
      <ol className="ss-rail" aria-labelledby="rail-label">
        {STEPS.map((s, i) => {
          const done = i < active; const current = i === active;
          return (
            <li key={s.key} className={cn(done && 'is-done', current && 'is-current')} aria-current={current ? 'step' : undefined}>
              <span className="ss-rail-text"><strong>{t(`rail.${s.key}`)}</strong><small>{t(`role.${s.who}`)}{done ? ` · ${t('rail.done')}` : current ? ` · ${t('rail.now')}` : ''}</small></span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Errors appear next to the action that caused them, and take focus so they are announced. */
export function ErrorSlot({ state }: { state: { error: string; errorMsg?: Msg | undefined } }) {
  const { msg } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!state.error) return;
    ref.current?.focus();
    ref.current?.scrollIntoView?.({ block: 'nearest' });
  }, [state]);
  return state.error ? <Notice ref={ref} tone="bad" role="alert">{state.errorMsg ? msg(state.errorMsg) : state.error}</Notice> : null;
}
