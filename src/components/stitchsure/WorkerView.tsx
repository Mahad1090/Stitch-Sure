import { CircleAlert, Flag, Scissors, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CUSTOMER, ORDER, PART_LABEL, PROBLEM_KINDS, RELEVANT_MEASUREMENT } from '@/lib/sample';
import { Card, Chip, ErrorSlot, Facts, Field, Notice, OptionList } from './ui';
import { Garment } from './Garment';
import type { StitchSureModel } from './useStitchSure';

/** Worker portal: one job, one current version, everything needed to sew it (critique rows 28–33). */
export function WorkerView({ m }: { m: StitchSureModel }) {
  const { state, dispatch, worker, busy } = m;
  const pending = state.request?.status === 'Pending';
  const replaced = state.events.filter(e => e.status === 'Superseded');
  const relevant = state.request?.status === 'Approved' ? RELEVANT_MEASUREMENT[state.request.part] : RELEVANT_MEASUREMENT.Sleeve;
  const firstName = CUSTOMER.name.split(' ')[0];
  if (worker.reportOpen) return <ReportForm m={m} />;
  return (
    <div className="ss-worker">
      <section className="ss-current" aria-labelledby="current-title">
        <header className="ss-current-head">
          <span className="ss-current-badge"><ShieldCheck aria-hidden />CURRENT</span>
          <Chip status={state.finished ? 'Finished' : 'Approved'} />
        </header>
        <h2 id="current-title">Version {state.version} · {ORDER.garment}</h2>
        <p className="ss-meta"><strong>{ORDER.id}</strong> · {ORDER.garment} · {firstName} · Due {ORDER.delivery.replace(', 2026', '')}</p>
        <p className="ss-meta">Approved by customer ({firstName}) on {state.approvedAt}</p>
        <div className="ss-current-body ss-current-3">
          <Garment sleeve={state.sleeve} neckline={state.neckline} />
          <div>
            <h3 className="ss-subhead">Final instructions (Version {state.version})</h3>
            <Facts label={`Final instructions, Version ${state.version}`} rows={[
              { label: PART_LABEL.Sleeve, value: <strong className="ss-big">{state.sleeve}</strong> },
              { label: PART_LABEL.Neckline, value: state.neckline },
              { label: 'Fabric', value: ORDER.fabric },
              { label: 'Due date', value: ORDER.delivery },
            ]} />
          </div>
          <div>
            <h3 className="ss-subhead">Measurements</h3>
            <Facts label="Measurements" rows={CUSTOMER.measurements.map(x => ({ label: x.label, value: x.value, flag: x.label === relevant ? 'Check this one' : undefined }))} />
          </div>
        </div>
        {pending && <Notice tone="info">A change is waiting for the customer’s decision. Hold stitching until it is decided.</Notice>}
        {state.paused && <Notice tone="bad">Problem reported. Work on this part is on hold until Master Mahad replies.</Notice>}
        {state.finished && <Notice tone="ok">Marked as finished. Master Mahad has been told.</Notice>}
        {!state.stitching && (
          <label className="ss-confirm" htmlFor="read-current">
            <Checkbox id="read-current" className="h-6 w-6" checked={state.acknowledged} disabled={busy || state.paused} onCheckedChange={v => dispatch({ type: 'acknowledge', value: v === true })} />
            <span>I have read the current version</span>
          </label>
        )}
        <ErrorSlot state={state} />
        <div className="ss-actions">
          {!state.stitching
            ? <Button className="ss-wide" disabled={busy || state.paused} onClick={() => dispatch({ type: 'start' })}><Scissors />Confirm and start stitching</Button>
            : !state.finished && <Button className="ss-wide" disabled={busy || state.paused} onClick={() => dispatch({ type: 'finish', at: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })}><Flag />Mark as finished</Button>}
          {!state.finished && <Button variant="outline" disabled={busy || state.paused} onClick={() => worker.setReportOpen(true)}><CircleAlert />Report a problem</Button>}
        </div>
        {replaced.length > 0 && (
          <>
            <Button variant="link" className="ss-link" aria-expanded={worker.showEarlier} onClick={() => worker.setShowEarlier(!worker.showEarlier)}>See earlier version (replaced)</Button>
            {worker.showEarlier && (
              <ul className="ss-superseded">
                {replaced.map((e, i) => <li key={i}><div><s>{e.title}</s><p>{e.text}</p><p><strong>Replaced. Do not use.</strong></p></div><Chip status="Superseded" /></li>)}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/** W3: say what is wrong, send it, and know what happens next (row 32). */
function ReportForm({ m }: { m: StitchSureModel }) {
  const { state, worker } = m;
  return (
    <Card title="Report a problem" aside={<span className="ss-sample">{ORDER.id} · {ORDER.garment}</span>}>
      <OptionList legend="What kind of problem?" value={worker.problemKind} options={PROBLEM_KINDS.map(k => ({ value: k, label: k }))} onChange={worker.setProblemKind} />
      <Field label="Describe the problem" htmlFor="problem" hint="Master Mahad gets this in StitchSure. Work on this part goes on hold until he replies."><Textarea id="problem" rows={3} value={worker.problem} onChange={e => worker.setProblem(e.target.value)} placeholder="Name the part and what is wrong…" /></Field>
      <ErrorSlot state={state} />
      <div className="ss-actions">
        <Button onClick={worker.sendReport}>Send report</Button>
        <Button variant="outline" onClick={() => worker.setReportOpen(false)}>Cancel</Button>
      </div>
    </Card>
  );
}
