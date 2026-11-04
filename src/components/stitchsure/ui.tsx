import { forwardRef, useEffect, useId, useRef, type ReactNode } from 'react';
import { Check, CircleAlert, Clock3, Layers, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEPS } from '@/lib/status';

/** Status is always words plus an icon, never colour alone. */
const OK = ['Approved', 'Can be made', 'Current', 'Finished'];
const BAD = ['Rejected', 'Cannot be made', 'Declined', 'Cancelled'];
const OFF = ['Superseded', 'Replaced'];
export function Chip({ status }: { status: string }) {
  const tone = OK.includes(status) || /^Agreed · /.test(status) ? 'ok' : BAD.includes(status) ? 'bad' : OFF.includes(status) ? 'off' : 'wait';
  const Icon = tone === 'ok' ? Check : tone === 'bad' ? X : tone === 'off' ? Layers : Clock3;
  return <span className={cn('ss-chip', `ss-chip-${tone}`)}><Icon aria-hidden />{status === 'Superseded' ? 'Replaced' : status}</span>;
}

export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'md' | 'lg' }) {
  return <span className={cn('ss-avatar', size === 'lg' && 'ss-avatar-lg')} aria-hidden>{initials}</span>;
}

/** A bordered group: one idea per card (common region). */
export function Card({ title, step, aside, children, className, id }: { title: string; step?: string; aside?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  const hid = useId();
  return (
    <section id={id} className={cn('ss-card', className)} aria-labelledby={hid}>
      <header className="ss-card-head">
        {step && <span className="ss-step-badge" aria-hidden>{step}</span>}
        <h2 id={hid}>{title}</h2>
        {aside && <div className="ss-card-aside">{aside}</div>}
      </header>
      {children}
    </section>
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

type Opt<T extends string> = { value: T; label: string; hint?: string };

/** Segmented control built on native radios: arrow keys, labels and state come free. */
export function Segmented<T extends string>({ legend, value, options, onChange, disabled, hideLegend, className }: { legend: string; value: T | ''; options: Opt<T>[]; onChange: (v: T) => void; disabled?: boolean | undefined; hideLegend?: boolean; className?: string }) {
  const name = useId();
  return (
    <fieldset className={cn('ss-seg', className)} disabled={disabled}>
      <legend className={cn('ss-label', hideLegend && 'ss-sr')}>{legend}</legend>
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

/** Inset grouped list of radio rows, each with a one-line description (recognition over recall). */
export function OptionList<T extends string>({ legend, value, options, onChange, disabled }: { legend: string; value: T | ''; options: Opt<T>[]; onChange: (v: T) => void; disabled?: boolean | undefined }) {
  const name = useId();
  return (
    <fieldset className="ss-options" disabled={disabled}>
      <legend className="ss-label">{legend}</legend>
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
  return (
    <div className="ss-rail-wrap">
    <p className="ss-rail-label" id="rail-label">Change request status{active < 0 && <span>: no change requested yet</span>}</p>
    <ol className="ss-rail" aria-labelledby="rail-label">
      {STEPS.map((s, i) => {
        const done = i < active; const current = i === active;
        return (
          <li key={s.key} className={cn(done && 'is-done', current && 'is-current')} aria-current={current ? 'step' : undefined}>
            <span className="ss-rail-dot" aria-hidden>{done ? <Check /> : i + 1}</span>
            <span className="ss-rail-text"><strong>{s.label}</strong><small>{s.who}{done ? ' · done' : current ? ' · now' : ''}</small></span>
          </li>
        );
      })}
    </ol>
    </div>
  );
}

/** Errors appear next to the action that caused them, and take focus so they are announced. */
export function ErrorSlot({ state }: { state: { error: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!state.error) return;
    ref.current?.focus();
    ref.current?.scrollIntoView?.({ block: 'nearest' });
  }, [state]);
  return state.error ? <Notice ref={ref} tone="bad" role="alert">{state.error}</Notice> : null;
}
