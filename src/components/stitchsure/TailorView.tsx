import { ArrowRight, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CUSTOMER, ORDER, RELEVANT_MEASUREMENT, outcomeHelp, outcomeLabel, noticeText } from '@/lib/sample';
import { requestedLabel, type Outcome, type ProductionStage } from '@/lib/workflow';
import { Avatar, Card, Chip, ErrorSlot, Facts, Field, Notice, Segmented } from './ui';
import { Garment } from './Garment';
import type { StitchSureModel } from './useStitchSure';

const STAGES: { value: ProductionStage; label: string }[] = [{ value: 'Not cut', label: 'Not cut' }, { value: 'Cut', label: 'Cut' }, { value: 'Stitching', label: 'Stitching' }];
const OUTCOMES: { value: Outcome; label: string }[] = (['Possible', 'Impossible', 'Needs clarification'] as Outcome[]).map(o => ({ value: o, label: outcomeLabel[o] }));

/** Reading order for the tailor: 1 who is asking, 2 what they want, 3 your decision. */
export function TailorView({ m }: { m: StitchSureModel }) {
  const { state, dispatch } = m;
  const r = state.request;
  return (
    <div className="ss-tailor">
        {state.paused && (
          <Card title="Problem reported by Shayan" className="ss-span" aside={<Chip status="Waiting for you" />}>
            <blockquote className="ss-quote">“{[...state.events].reverse().find(e => e.title === 'Worker reported a problem')?.text}”</blockquote>
            <p className="ss-meta">Work on SS-014 is on hold until you reply.</p>
            <div className="ss-actions"><Button variant="outline" onClick={() => dispatch({ type: 'resolve', at: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) })}>Mark as solved and resume work</Button></div>
          </Card>
        )}
        <CustomerCard relevant={r?.part} />
        <RequestCard m={m} />
        <ReviewCard m={m} />
    </div>
  );
}

function CustomerCard({ relevant }: { relevant: 'Sleeve' | 'Neckline' | undefined }) {
  const key = relevant ? RELEVANT_MEASUREMENT[relevant] : undefined;
  return (
    <Card title="Customer" step="1" className="ss-hcard ss-span" aside={<span className="ss-sample">Sample data</span>}>
      <div className="ss-hbody">
      <div>
      <div className="ss-person">
        <Avatar initials={CUSTOMER.initials} size="lg" />
        <div>
          <h3>{CUSTOMER.name}</h3>
          <p>{CUSTOMER.since}</p>
          <p>{CUSTOMER.contact}</p>
        </div>
      </div>
      <h3 className="ss-subhead">This order</h3>
      <Facts label="Order details" rows={[
        { label: 'Order', value: `${ORDER.id} · ${ORDER.garment}` },
        { label: 'Fabric', value: ORDER.fabric },
        { label: 'Placed', value: ORDER.placed },
        { label: 'Delivery', value: ORDER.delivery },
        { label: 'Needed for', value: `${ORDER.event} · ${ORDER.eventDate}` },
      ]} />
      </div>
      <div>
      <h3 className="ss-subhead ss-subhead-box">Measurements</h3>
      <Facts label="Measurements" rows={CUSTOMER.measurements.map(x => ({ label: x.label, value: x.value, flag: x.label === key ? 'Relevant to this request' : undefined }))} />
      </div>
      </div>
    </Card>
  );
}

function RequestCard({ m }: { m: StitchSureModel }) {
  const { state, decide, busy } = m;
  const r = state.request;
  if (!r) {
    return (
      <Card title="What they want" step="2">
        <div className="ss-empty">
          <p><strong>No change request yet.</strong></p>
          <p>When Areeba asks for a change, it appears here beside her details.</p>
        </div>
      </Card>
    );
  }
  const sentAt = [...state.events].reverse().find(e => e.title.endsWith('change requested'))?.at;
  const pending = r.status === 'Pending';
  const wanted = requestedLabel(r);
  const wantSleeve = r.part === 'Sleeve' ? wanted : state.sleeve;
  const wantNeck = r.part === 'Neckline' ? wanted : state.neckline;
  return (
    <Card title="What they want" step="2" className="ss-hcard" aside={<Chip status={r.status === 'Pending' ? 'Waiting for you' : r.status} />}>
      <p className="ss-ask"><span>{r.part}</span> → <strong>{wanted}</strong></p>
      {sentAt && <p className="ss-meta">Requested {sentAt}</p>}
      <div className="ss-hbody">
      <div>
      {pending && (
        <div className="ss-compare" role="group" aria-label="Current design compared with the requested design">
          <figure><Garment small sleeve={state.sleeve} neckline={state.neckline} part={r.part} /><figcaption><span>Now · Version {state.version}</span><strong>{r.part === 'Sleeve' ? state.sleeve : state.neckline}</strong></figcaption></figure>
          <ArrowRight aria-hidden className="ss-compare-arrow" />
          <figure><Garment small sleeve={wantSleeve} neckline={wantNeck} part={r.part} /><figcaption><span>Requested</span><strong>{wanted}</strong></figcaption></figure>
        </div>
      )}
      </div>
      <div>
      <h3 className="ss-subhead">Customer’s note</h3>
      {r.note ? <blockquote className="ss-quote">“{r.note}”</blockquote> : <p className="ss-meta">No note added.</p>}
      {r.answer && <><h3 className="ss-subhead">Her reply to your question</h3><blockquote className="ss-quote">“{r.answer}”</blockquote></>}
      <h3 className="ss-subhead">Reference</h3>
      {r.reference ? <div className="ss-ref"><span className="ss-ref-thumb" aria-hidden><Garment small sleeve={r.part === 'Sleeve' ? r.style : 'Straight sleeve'} neckline={r.part === 'Neckline' ? r.style : 'Round neckline'} label="" /></span><span><strong>{r.part === 'Sleeve' ? 'bell-sleeve' : 'neckline'}-reference.jpg</strong><small>Sample attachment (simulated upload)</small></span></div> : <p className="ss-meta">No reference attached.</p>}
      {pending && (
        <div className="ss-seen">
          {r.seen
            ? <p><Eye aria-hidden /> Seen. <strong>Still waiting for your review</strong>: seen is not the same as accepted.</p>
            : <><p><Eye aria-hidden /> Not opened yet.</p><Button variant="outline" disabled={busy} onClick={decide.markSeen}>Mark as seen</Button></>}
        </div>
      )}
      </div>
      </div>
    </Card>
  );
}

function ReviewCard({ m }: { m: StitchSureModel }) {
  const { state, dispatch, review, busy } = m;
  const r = state.request;
  if (!r) return <Card title="Your review" step="3" focusTarget><p className="ss-meta">Nothing to review yet.</p></Card>;
  if (r.status !== 'Pending') return <Card title="Your review" step="3" focusTarget aside={<Chip status={r.status === 'Rejected' ? 'Declined' : r.status} />}><p className="ss-meta">{r.status === 'Approved' ? `Areeba approved this. Version ${state.version} is now the only version Shayan sees.` : 'Areeba kept her original design. Nothing changes for Shayan.'}</p></Card>;
  if (r.outcome) {
    return (
      <Card title="Your review" step="3" focusTarget aside={<Chip status="Pending" />}>
        <p className="ss-meta">{r.outcome === 'Needs clarification' ? 'Question sent. Waiting for Areeba to reply.' : 'Sent. The request stays open until Areeba decides.'}</p>
        <Facts label="What you sent" rows={[
          { label: 'Outcome', value: outcomeLabel[r.outcome] },
          { label: r.outcome === 'Needs clarification' ? 'Question' : 'Reason', value: r.reason || 'None' },
          ...(r.alternative ? [{ label: 'Alternative', value: r.alternative }] : []),
          ...(r.outcome !== 'Needs clarification' ? [{ label: 'Cost', value: r.cost ?? '' }, { label: 'Delivery', value: r.date ?? '' }] : []),
        ]} />
      </Card>
    );
  }
  const cutAdvisory = state.stage !== 'Not cut' && r.style === 'Bell sleeves';
  const o = review.outcome;
  const ask = o === 'Needs clarification';
  const reasonLabel = o === 'Impossible' ? 'Reason it cannot be made (required)' : 'Note for Areeba (optional)';
  return (
    <Card title="Your review" step="3" focusTarget aside={<Chip status="Pending" />}>
      <Segmented legend="Production stage" value={state.stage} options={STAGES} disabled={busy} onChange={v => dispatch({ type: 'stage', stage: v })} />
      <p className="ss-hint">Cutting and stitching limit which changes are still possible.</p>
      {cutAdvisory && <Notice tone="info">Fabric is already cut. Bell sleeves usually can’t be made now. Consider offering Cuff Trim.</Notice>}
      <ErrorSlot state={state} />
      <Segmented legend="Can this be made?" value={o} options={OUTCOMES} disabled={busy} onChange={review.setOutcome} />
      <p className="ss-hint">{o ? outcomeHelp[o] : 'Choose one to continue. Nothing is selected for you.'}</p>
      {!o ? null : ask
        ? <Field label="Your question to the customer" htmlFor="review-question"><Textarea id="review-question" rows={3} value={review.question} onChange={e => review.setQuestion(e.target.value)} /></Field>
        : <Field label={reasonLabel} htmlFor="review-reason"><Textarea id="review-reason" rows={3} value={review.reason} onChange={e => review.setReason(e.target.value)} /></Field>}
      {o === 'Impossible' && <Field label="Offer this instead (required)" htmlFor="review-alt"><Input id="review-alt" value={review.alternative} onChange={e => review.setAlternative(e.target.value)} /></Field>}
      {o && !ask && (
        <div className="ss-two">
          <Field label="Cost effect" htmlFor="review-cost"><Input id="review-cost" value={review.cost} onChange={e => review.setCost(e.target.value)} /></Field>
          <Field label="Delivery effect" htmlFor="review-date"><Input id="review-date" value={review.date} onChange={e => review.setDate(e.target.value)} /></Field>
        </div>
      )}
      {o && (<>
      <div className="ss-preview" aria-label="What Areeba will see">
        <span>Areeba will see</span>
        <p>{ask ? <>Question: <strong>{review.question || '…'}</strong></> : <><strong>{requestedLabel(r)}</strong>: {outcomeLabel[o]}{o === 'Impossible' && review.alternative ? ` · Offer: ${review.alternative}` : ''} · {review.cost || 'cost?'} · {review.date || 'delivery?'}</>}</p>
      </div>
      <div className="ss-np"><span className="ss-np-label">In-app notice to Areeba (sample, nothing is really sent)</span><p className="ss-np-bubble">{noticeText({ part: r.part, style: requestedLabel(r), outcome: o, reason: ask ? review.question : review.reason, alternative: review.alternative, cost: review.cost, date: review.date })}</p></div>
      </>)}
      <div className="ss-actions"><Button disabled={busy || !o} onClick={review.sendReview}><Send />{ask ? 'Send question' : 'Send review to customer'}</Button></div>
    </Card>
  );
}
