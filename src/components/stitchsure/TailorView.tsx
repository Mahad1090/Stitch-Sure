import { ArrowRight, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CUSTOMER, ORDER, RELEVANT_MEASUREMENT, noticeText } from '@/lib/sample';
import { useLang } from '@/lib/i18n';
import { requestedLabel, type Outcome, type ProductionStage } from '@/lib/workflow';
import { Timeline } from './Activity';
import { Avatar, Card, Chip, Disclosure, ErrorSlot, Facts, Field, Notice, OptionList, Segmented, focusProps } from './ui';
import { Garment } from './Garment';
import type { StitchSureModel } from './useStitchSure';

const STAGES: ProductionStage[] = ['Not cut', 'Cut', 'Stitching'];
const OUTCOMES: Outcome[] = ['Possible', 'Impossible', 'Needs clarification'];

/** One decision at a time: what the customer wants, then the review. Everything else is behind a disclosure. */
export function TailorView({ m }: { m: StitchSureModel }) {
  const { t, msg } = useLang();
  const { state, worker } = m;
  const r = state.request;
  // Stored titles are always English, whatever language is on screen.
  const report = [...state.events].reverse().find(e => e.title === 'Worker reported a problem');
  return (
    <div className="ss-stack ss-narrow">
      {state.paused && (
        <Card title={t('tailor.problem.title')} aside={<Chip status="Waiting for you" />}>
          <blockquote className="ss-quote"><bdi>“{report?.msg ? msg(report.msg.text) : report?.text}”</bdi></blockquote>
          <p className="ss-meta">{t('tailor.problem.hold')}</p>
          <div className="ss-actions"><Button variant="outline" onClick={worker.resolveProblem}>{t('tailor.problem.solve')}</Button></div>
        </Card>
      )}
      <RequestCard m={m} />
      {r && <ReviewCard m={m} />}
      <MoreCard m={m} />
    </div>
  );
}

function RequestCard({ m }: { m: StitchSureModel }) {
  const { t, term } = useLang();
  const { state, decide, busy } = m;
  const r = state.request;
  if (!r) {
    return (
      <Card title={t('tailor.request.title')} focusTarget>
        <div className="ss-empty">
          <p><strong>{t('tailor.empty.title')}</strong></p>
          <p>{t('tailor.empty.text')}</p>
        </div>
      </Card>
    );
  }
  const sentAt = [...state.events].reverse().find(e => e.title.endsWith('change requested'))?.at;
  const pending = r.status === 'Pending';
  const wanted = requestedLabel(r);
  return (
    <Card title={t('tailor.request.title')} aside={<Chip status={pending ? (r.outcome ? 'Waiting for the customer' : 'Waiting for you') : r.status} />}>
      <p className="ss-ask"><span>{t(`part.${r.part}`)}:</span> <strong>{term(wanted)}</strong></p>
      {sentAt && <p className="ss-meta">{t('tailor.sentAt', { at: sentAt })}</p>}
      {pending && (
        <div className="ss-compare" role="group" aria-label={t('tailor.compare')}>
          <figure><Garment small sleeve={state.sleeve} neckline={state.neckline} part={r.part} /><figcaption><span>{t('tailor.now', { version: state.version })}</span><strong>{term(r.part === 'Sleeve' ? state.sleeve : state.neckline)}</strong></figcaption></figure>
          <ArrowRight aria-hidden className="ss-compare-arrow ss-flip" />
          <figure><Garment small sleeve={r.part === 'Sleeve' ? wanted : state.sleeve} neckline={r.part === 'Neckline' ? wanted : state.neckline} part={r.part} /><figcaption><span>{t('tailor.requested')}</span><strong>{term(wanted)}</strong></figcaption></figure>
        </div>
      )}
      <h3 className="ss-subhead">{t('tailor.note')}</h3>
      {r.note ? <blockquote className="ss-quote"><bdi>“{r.note}”</bdi></blockquote> : <p className="ss-meta">{t('waiting.noNote')}</p>}
      {r.answer && <><h3 className="ss-subhead">{t('tailor.reply')}</h3><blockquote className="ss-quote"><bdi>“{r.answer}”</bdi></blockquote></>}
      <h3 className="ss-subhead">{t('tailor.photo')}</h3>
      {r.reference
        ? <div className="ss-ref"><span className="ss-ref-thumb" aria-hidden><Garment small sleeve={r.part === 'Sleeve' ? wanted : 'Straight sleeve'} neckline={r.part === 'Neckline' ? wanted : 'Round neckline'} /></span><span><strong><bdi dir="ltr">{r.part === 'Sleeve' ? 'sleeve' : 'neckline'}-reference.jpg</bdi></strong><small>{t('tailor.photoSample')}</small></span></div>
        : <p className="ss-meta">{t('tailor.noPhoto')}</p>}
      {pending && (
        <div className="ss-seen">
          {r.seen
            ? <p><Eye aria-hidden />{t('tailor.seen')}</p>
            : <><p><Eye aria-hidden />{t('tailor.notSeen')}</p><Button variant="outline" disabled={busy} onClick={decide.markSeen}>{t('tailor.markSeen')}</Button></>}
        </div>
      )}
    </Card>
  );
}

function ReviewCard({ m }: { m: StitchSureModel }) {
  const { t, term, lang } = useLang();
  const { state, dispatch, review, busy } = m;
  const r = state.request!;
  if (r.status !== 'Pending') {
    return (
      <Card title={t('review.title')} focusTarget aside={<Chip status={r.status === 'Rejected' ? 'Declined' : 'Approved'} />}>
        <p className="ss-meta">{r.status === 'Approved' ? t('review.approved', { version: state.version }) : t('review.declined')}</p>
      </Card>
    );
  }
  if (r.outcome) {
    const ask = r.outcome === 'Needs clarification';
    return (
      <Card title={t('review.title')} focusTarget aside={<Chip status="Pending" />}>
        <p className="ss-meta">{t(ask ? 'review.waitingReply' : 'review.waitingDecision')}</p>
        <Facts label={t('review.sentLabel')} rows={[
          { label: t('review.field.outcome'), value: t(`outcome.${r.outcome}`) },
          { label: t(ask ? 'review.field.question' : 'review.field.reason'), value: <bdi>{r.reason || t('fact.none')}</bdi> },
          ...(r.alternative ? [{ label: t('review.field.alternative'), value: term(r.alternative) }] : []),
          ...(ask ? [] : [{ label: t('review.field.cost'), value: <bdi>{r.cost}</bdi> }, { label: t('review.field.delivery'), value: <bdi>{r.date}</bdi> }]),
        ]} />
      </Card>
    );
  }
  const cutAdvisory = state.stage !== 'Not cut' && r.style === 'Bell sleeves';
  const o = review.outcome;
  const ask = o === 'Needs clarification';
  return (
    <section className="ss-card" aria-labelledby="review-title">
      <header className="ss-card-head"><h2 id="review-title" {...focusProps(true)}>{t('review.title')}</h2></header>
      {cutAdvisory && <Notice tone="info">{t('stage.cutAdvisory')}</Notice>}
      <ErrorSlot state={state} />
      <OptionList<Outcome> legend={t('review.question.legend')} value={o} disabled={busy} options={OUTCOMES.map(value => ({ value, label: t(`outcome.${value}`) }))} onChange={review.setOutcome} />
      <p className="ss-hint" id="review-help">{o ? t(`outcome.help.${o}`) : t('review.choose')}</p>
      {o && ask && <Field label={t('review.question')} htmlFor="review-question"><Textarea id="review-question" rows={3} value={review.question} onChange={e => review.setQuestion(e.target.value)} /></Field>}
      {o && !ask && <Field label={t(o === 'Impossible' ? 'review.reason' : 'review.noteOptional')} htmlFor="review-reason"><Textarea id="review-reason" rows={3} value={review.reason} onChange={e => review.setReason(e.target.value)} /></Field>}
      {o === 'Impossible' && <Field label={t('review.alternative')} htmlFor="review-alt"><Input id="review-alt" value={review.alternative} onChange={e => review.setAlternative(e.target.value)} /></Field>}
      {o && !ask && (
        <div className="ss-two">
          <Field label={t('review.cost')} htmlFor="review-cost"><Input id="review-cost" value={review.cost} onChange={e => review.setCost(e.target.value)} /></Field>
          <Field label={t('review.date')} htmlFor="review-date"><Input id="review-date" value={review.date} onChange={e => review.setDate(e.target.value)} /></Field>
        </div>
      )}
      {o && (
        <div className="ss-np">
          <span className="ss-np-label">{t('review.preview')}</span>
          <p className="ss-np-bubble">{noticeText({ part: r.part, style: requestedLabel(r), outcome: o, reason: ask ? review.question : review.reason, alternative: review.alternative, cost: review.cost, date: review.date }, lang)}</p>
          <p className="ss-hint">{t('review.simulated')}</p>
        </div>
      )}
      <div className="ss-actions"><Button size="lg" className="ss-wide" disabled={busy || !o} aria-describedby="review-help" onClick={review.sendReview}><Send className="ss-flip" aria-hidden />{t(ask ? 'review.sendQuestion' : 'review.send')}</Button></div>
      <Disclosure label={t('stage.summary', { stage: term(state.stage) })}>
        <Segmented<ProductionStage> legend={t('stage.legend')} value={state.stage} options={STAGES.map(value => ({ value, label: term(value) }))} disabled={busy} onChange={stage => dispatch({ type: 'stage', stage })} />
        <p className="ss-hint">{t('stage.hint')}</p>
      </Disclosure>
    </section>
  );
}

/** Secondary information, closed until asked for. */
function MoreCard({ m }: { m: StitchSureModel }) {
  const { t, term } = useLang();
  const { state } = m;
  const part = state.request?.part;
  const key = part ? RELEVANT_MEASUREMENT[part] : undefined;
  return (
    <Card title={t('tailor.more')}>
      <Disclosure label={t('tailor.customer')}>
        <div className="ss-person">
          <Avatar initials={CUSTOMER.initials} />
          <div>
            <h3>{CUSTOMER.name}</h3>
            <p>{term(CUSTOMER.since)}</p>
            <p>{term(CUSTOMER.contact)}</p>
          </div>
        </div>
        <Facts label={t('tailor.customer')} rows={[
          { label: t('detail.order'), value: <><bdi dir="ltr">{ORDER.id}</bdi> · {term(ORDER.garment)}</> },
          { label: t('fact.fabric'), value: term(ORDER.fabric) },
          { label: t('tile.stage'), value: term(state.stage) },
          { label: t('tile.agreed'), value: t('version.n', { version: state.version }) },
          { label: t('detail.placed'), value: <bdi dir="ltr">{ORDER.placed}</bdi> },
          { label: t('tile.delivery'), value: <bdi dir="ltr">{ORDER.delivery}</bdi> },
          { label: t('fact.neededFor'), value: <>{term(ORDER.event)} · <bdi dir="ltr">{ORDER.eventDate}</bdi></> },
        ]} />
        <p className="ss-hint">{t('tailor.sample')}</p>
      </Disclosure>
      <Disclosure label={t('measurements.title')}>
        <Facts label={t('measurements.title')} rows={CUSTOMER.measurements.map(x => ({ label: term(x.label), value: <bdi dir="ltr">{x.value}</bdi>, flag: x.label === key ? t('tailor.relevant') : undefined }))} />
      </Disclosure>
      <Disclosure label={t('tailor.history')}><Timeline events={state.events} /></Disclosure>
    </Card>
  );
}
