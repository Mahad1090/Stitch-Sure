import { CircleAlert, Flag, Scissors, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CUSTOMER, ORDER, PROBLEM_KINDS, RELEVANT_MEASUREMENT } from '@/lib/sample';
import { t, term } from '@/lib/i18n';
import { Card, Chip, Disclosure, ErrorSlot, Facts, Field, Notice, OptionList, focusProps } from './ui';
import { Garment } from './Garment';
import type { StitchSureModel } from './useStitchSure';

/** Worker portal: the job, and nothing else (critique rows 28–33). */
export function WorkerView({ m }: { m: StitchSureModel }) {
  const { state, dispatch, worker, busy } = m;
  const r = state.request;
  const pending = r?.status === 'Pending';
  const replaced = state.events.filter(e => e.status === 'Superseded');
  const relevant = r?.status === 'Approved' ? RELEVANT_MEASUREMENT[r.part] : RELEVANT_MEASUREMENT.Sleeve;
  const updated = state.version > 1 && !state.acknowledged && !state.stitching && !state.finished;
  if (worker.reportOpen) return <ReportForm m={m} />;
  return (
    <div className="ss-stack ss-narrow">
      <section className="ss-card ss-current" aria-labelledby="current-title">
        <header className="ss-current-head">
          <span className="ss-current-badge"><ShieldCheck aria-hidden />{t('worker.badge')}</span>
          <Chip status={state.finished ? 'Finished' : 'Approved'} />
        </header>
        <h2 id="current-title" {...focusProps(true)}>{t('version.n', { version: state.version })} · {term(ORDER.garment)}</h2>
        <p className="ss-meta">{t('worker.meta', { id: ORDER.id, name: CUSTOMER.name, date: state.approvedAt })}</p>
        {updated && <Notice tone="info" role="status">{t('worker.updated', { version: state.version, old: state.version - 1 })}</Notice>}
        <div className="ss-job">
          <Garment sleeve={state.sleeve} neckline={state.neckline} />
          <Facts label={t('worker.job', { version: state.version })} rows={[
            { label: t('part.Sleeve'), value: <strong className="ss-big">{term(state.sleeve)}</strong> },
            { label: t('part.Neckline'), value: <strong className="ss-big">{term(state.neckline)}</strong> },
            { label: t('fact.fabric'), value: term(ORDER.fabric) },
            { label: t('fact.due'), value: <bdi dir="ltr">{ORDER.delivery}</bdi> },
            ...(r?.status === 'Approved' && r.note ? [{ label: t('worker.notes'), value: `“${r.note}”` }] : []),
          ]} />
        </div>
        {pending && <Notice tone="info">{t('worker.pending')}</Notice>}
        {state.paused && <Notice tone="bad">{t('worker.paused')}</Notice>}
        {state.finished && <Notice tone="ok">{t('worker.finished')}</Notice>}
        {!state.stitching && (
          <label className="ss-confirm" htmlFor="read-current">
            <Checkbox id="read-current" className="h-6 w-6" checked={state.acknowledged} disabled={busy || state.paused} onCheckedChange={v => dispatch({ type: 'acknowledge', value: v === true })} />
            <span>{t('worker.read')}</span>
          </label>
        )}
        <ErrorSlot state={state} />
        {!state.finished && (
          <div className="ss-actions">
            {!state.stitching
              ? <Button size="lg" className="ss-wide" disabled={busy || state.paused} onClick={() => dispatch({ type: 'start' })}><Scissors aria-hidden />{t('worker.start')}</Button>
              : <Button size="lg" className="ss-wide" disabled={busy || state.paused} onClick={worker.finish}><Flag aria-hidden />{t('worker.finish')}</Button>}
          </div>
        )}
        <div className="ss-secondary">
          <Disclosure label={t('measurements.title')}>
            <Facts label={t('measurements.title')} rows={CUSTOMER.measurements.map(x => ({ label: term(x.label), value: <bdi dir="ltr">{x.value}</bdi>, flag: x.label === relevant ? t('worker.check') : undefined }))} />
          </Disclosure>
          {replaced.length > 0 && (
            <Disclosure label={t('worker.earlier')}>
              <ul className="ss-superseded">
                {replaced.map((e, i) => <li key={i}><div><s>{e.title}</s><p>{e.text}</p><p><strong>{t('worker.doNotUse')}</strong></p></div><Chip status="Superseded" /></li>)}
              </ul>
            </Disclosure>
          )}
          {!state.finished && <Button variant="outline" disabled={busy || state.paused} onClick={() => worker.setReportOpen(true)}><CircleAlert aria-hidden />{t('worker.report')}</Button>}
        </div>
      </section>
    </div>
  );
}

/** W3: say what is wrong, send it, and know what happens next (row 32). */
function ReportForm({ m }: { m: StitchSureModel }) {
  const { state, worker } = m;
  return (
    <Card title={t('worker.report')} focusTarget className="ss-narrow">
      <OptionList legend={t('report.kind')} value={worker.problemKind} options={PROBLEM_KINDS.map(k => ({ value: k as string, label: term(k) }))} onChange={worker.setProblemKind} />
      <Field label={t('report.describe')} htmlFor="problem" hint={t('report.hint')}><Textarea id="problem" rows={3} value={worker.problem} onChange={e => worker.setProblem(e.target.value)} placeholder={t('report.placeholder')} /></Field>
      <ErrorSlot state={state} />
      <div className="ss-actions">
        <Button onClick={worker.sendReport}>{t('report.send')}</Button>
        <Button variant="outline" onClick={() => worker.setReportOpen(false)}>{t('report.cancel')}</Button>
      </div>
    </Card>
  );
}
