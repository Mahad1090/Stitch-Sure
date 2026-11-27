import { useState, type ReactNode } from 'react';
import { ArrowLeft, Check, ClipboardList, LoaderCircle, MessageSquare, PencilRuler, Send, Upload, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CUSTOMER, ORDER, STYLE_OPTIONS } from '@/lib/sample';
import { t, term } from '@/lib/i18n';
import { DESCRIBED, requestedLabel, type Part } from '@/lib/workflow';
import { Card, Chip, Disclosure, ErrorSlot, Facts, Field, Notice, OptionList, UndoNotice, focusProps } from './ui';
import { Garment } from './Garment';
import type { FormStep, StitchSureModel } from './useStitchSure';

/** Customer portal. One card at a time, chosen by whose turn it is, so there is always one clear next step. */
export function CustomerView({ m }: { m: StitchSureModel }) {
  const { state, customer } = m;
  const r = state.request;
  if (customer.screen === 'order') return <OrderScreen m={m} />;
  if (customer.screen === 'message') return <MessageCard m={m} />;
  if (r?.status === 'Pending') {
    if (!r.outcome) return <WaitingCard m={m} />;
    if (r.outcome === 'Needs clarification') return <QuestionCard m={m} />;
    return <DecisionCard m={m} />;
  }
  if (customer.showApproved && r?.status === 'Approved') return <ApprovedCard m={m} />;
  if (customer.screen === 'form') return <RequestForm m={m} />;
  return <HomeCard m={m} />;
}

function BackLink({ m, label = t('back.choices') }: { m: StitchSureModel; label?: string }) {
  return <Button variant="link" className="ss-link" disabled={m.busy} onClick={() => m.customer.go('home')}><ArrowLeft className="ss-flip" aria-hidden />{label}</Button>;
}

function SeeOrder({ m }: { m: StitchSureModel }) {
  return <Button variant="link" className="ss-link" onClick={() => m.customer.go('order')}><ClipboardList aria-hidden />{t('home.order')}</Button>;
}

/** C1: one question, three choices. */
function HomeCard({ m }: { m: StitchSureModel }) {
  const { state, customer, decide, busy } = m;
  const locked = state.stitching || state.paused;
  return (
    <Card title={t('home.title')} focusTarget className="ss-narrow">
      {state.undo && !state.stitching && !state.finished && <UndoNotice disabled={busy} onUndo={decide.undoApproval} />}
      <div className="ss-summary">
        <Garment small sleeve={state.sleeve} neckline={state.neckline} />
        <Facts label={t('home.agreed')} rows={[
          { label: t('fact.sleeve'), value: term(state.sleeve) },
          { label: t('fact.neckline'), value: term(state.neckline) },
          { label: t('fact.due'), value: <bdi dir="ltr">{ORDER.delivery}</bdi> },
        ]} />
      </div>
      <ul className="ss-choices">
        <li>
          <Choice id="change" icon={<PencilRuler aria-hidden />} title={t('home.change')} help={locked ? t(state.stitching ? 'home.change.locked' : 'home.change.paused') : t('home.change.help')} locked={locked} onClick={customer.openForm} />
        </li>
        <li><Choice id="order" icon={<ClipboardList aria-hidden />} title={t('home.order')} help={t('home.order.help')} onClick={() => customer.go('order')} /></li>
        <li><Choice id="message" icon={<MessageSquare aria-hidden />} title={t('home.message')} help={t('home.message.help')} onClick={() => customer.go('message')} /></li>
      </ul>
    </Card>
  );
}

/** A large choice button. A locked one stays focusable, so keyboard users can read why. */
function Choice({ id, icon, title, help, locked, onClick }: { id: string; icon: ReactNode; title: string; help: string; locked?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="ss-choice" aria-disabled={locked || undefined} aria-labelledby={`choice-${id}`} aria-describedby={`choice-${id}-help`} onClick={() => { if (!locked) onClick(); }}>
      <span className="ss-choice-icon">{icon}</span>
      <span className="ss-choice-text"><strong id={`choice-${id}`}>{title}</strong><small id={`choice-${id}-help`}>{help}</small></span>
    </button>
  );
}

/** C6 / C7: design details and history, only when asked for. */
function OrderScreen({ m }: { m: StitchSureModel }) {
  const { state, customer } = m;
  const r = state.request;
  const earlier = state.events.filter(e => e.status === 'Superseded');
  return (
    <div className="ss-stack">
      <BackLink m={m} label={customer.inProgress ? t('back.request') : t('back.choices')} />
      <Card title={t('orderScreen.title')} focusTarget aside={<Chip status="Agreed" version={state.version} />}>
        <div className="ss-job">
          <Garment sleeve={state.sleeve} neckline={state.neckline} />
          <Facts label={t('orderScreen.title')} rows={[
            { label: t('fact.sleeve'), value: term(state.sleeve) },
            { label: t('fact.neckline'), value: term(state.neckline) },
            { label: t('fact.fabric'), value: term(ORDER.fabric) },
            { label: t('fact.reference'), value: r?.reference && r.status === 'Approved' ? t('fact.referenceFile') : t('fact.none') },
            { label: t('fact.note'), value: r?.status === 'Approved' && r.note ? `“${r.note}”` : t('fact.none') },
            { label: t('fact.due'), value: <bdi dir="ltr">{ORDER.delivery}</bdi> },
            { label: t('fact.neededFor'), value: <>{term(ORDER.event)}, <bdi dir="ltr">{ORDER.eventDate}</bdi></> },
          ]} />
        </div>
        <Disclosure label={t('measurements.title')}>
          <Facts label={t('measurements.title')} rows={CUSTOMER.measurements.map(x => ({ label: term(x.label), value: <bdi dir="ltr">{x.value}</bdi> }))} />
        </Disclosure>
      </Card>
      <Card title={t('history.title')}>
        <Disclosure label={t('history.earlier', { count: earlier.length })}>
          {earlier.length
            ? <ul className="ss-list">{earlier.map((e, i) => <li key={i}><s>{e.title}</s> <span className="ss-meta">· {e.text} · {t('history.replaced')}</span></li>)}</ul>
            : <p className="ss-meta">{t('history.noEarlier')}</p>}
        </Disclosure>
        <Disclosure label={t('history.declined', { count: state.declined.length })}>
          {state.declined.length
            ? <ul className="ss-list">{state.declined.map((d, i) => <li key={i}>{d}</li>)}</ul>
            : <p className="ss-meta">{t('history.noDeclined')}</p>}
        </Disclosure>
      </Card>
    </div>
  );
}

/** One box and one button. Messaging is simulated. */
function MessageCard({ m }: { m: StitchSureModel }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <Card title={t('message.title')} focusTarget className="ss-narrow">
      <BackLink m={m} />
      <div role="status">{sent && <Notice tone="ok">{t('message.sent')}</Notice>}</div>
      {!sent && (
        <>
          <Field label={t('message.label')} htmlFor="cust-message" hint={t('message.hint')}><Textarea id="cust-message" rows={4} value={text} onChange={e => setText(e.target.value)} /></Field>
          <div className="ss-actions"><Button disabled={!text.trim()} aria-describedby="message-help" onClick={() => setSent(true)}><Send className="ss-flip" aria-hidden />{t('message.send')}</Button></div>
          <p className="ss-hint" id="message-help">{text.trim() ? t('message.simulated') : t('message.needText')}</p>
        </>
      )}
    </Card>
  );
}

/** C2: one question per screen. Choices are kept when going back. */
function RequestForm({ m }: { m: StitchSureModel }) {
  const { state, form, sending, busy } = m;
  const { step, part, style } = form;
  const current = part === 'Sleeve' ? state.sleeve : part === 'Neckline' ? state.neckline : '';
  const described = style === DESCRIBED;
  const question = t(step === 1 ? 'form.q.part' : step === 2 ? 'form.q.style' : 'form.q.note');
  const missing = step === 1 ? (!part && t('form.needPart')) : step === 2 ? (!style && t('form.needStyle')) : (described && !form.note.trim() && t('form.needNote'));
  const styles = part
    ? [
        ...STYLE_OPTIONS[part].map(value => ({ value: value as string, label: value === current ? t('form.current', { style: term(value) }) : term(value), hint: t(`style.hint.${value}`) })),
        { value: DESCRIBED as string, label: t('style.describe'), hint: t('style.describe.hint') },
      ]
    : [];
  return (
    <Card title={t('form.title')} className="ss-narrow">
      <BackLink m={m} />
      <p className="ss-stepcount" id="step-count">{t('form.step', { step })}</p>
      <div className="ss-progress" role="progressbar" aria-labelledby="step-count" aria-valuemin={0} aria-valuemax={3} aria-valuenow={step}><span style={{ inlineSize: `${(step / 3) * 100}%` }} /></div>
      {/* A new element per step, so focus lands on this step's heading. */}
      <h3 key={step} className="ss-question" {...focusProps(true)}>{question}</h3>
      <ErrorSlot state={state} />
      {step === 1 && (
        <>
          <p className="ss-hint">{t('form.tapHint')}</p>
          <Garment sleeve={state.sleeve} neckline={state.neckline} part={part} select={form.choosePart} />
          <OptionList<Part> legend={question} hideLegend value={part} options={(['Sleeve', 'Neckline'] as const).map(p => ({ value: p, label: t(`part.${p}`), hint: term(p === 'Sleeve' ? state.sleeve : state.neckline) }))} onChange={form.choosePart} />
        </>
      )}
      {step === 2 && <OptionList legend={question} hideLegend value={style} options={styles} onChange={form.setStyle} />}
      {step === 3 && part && (
        <>
          <Field label={t(described ? 'form.note.required' : 'form.note.optional')} htmlFor="req-note"><Textarea id="req-note" rows={3} value={form.note} onChange={e => form.setNote(e.target.value)} placeholder={t(`form.note.${part}`)} /></Field>
          <div className="ss-attach">
            <Button variant="outline" disabled={busy} onClick={() => form.setReference(!form.reference)}>{form.reference ? <Check aria-hidden /> : <Upload aria-hidden />}{t(form.reference ? 'form.removePhoto' : 'form.addPhoto')}</Button>
            <span className="ss-meta" role="status">{t(form.reference ? 'form.photoAttached' : 'form.photoOptional')}</span>
          </div>
          <div className="ss-preview">
            <span>{t('form.asking')}</span>
            <p><strong>{t(`part.${part}`)}: {term(current)} → {described ? `“${form.note.trim() || '…'}”` : term(style)}</strong></p>
            <p>{t('form.nothingChanges')}</p>
          </div>
        </>
      )}
      <div className="ss-actions ss-actions-split">
        <Button variant="outline" disabled={busy} onClick={() => (step === 1 ? m.customer.go('home') : form.setStep((step - 1) as FormStep))}><ArrowLeft className="ss-flip" aria-hidden />{t('back')}</Button>
        {step < 3
          ? <Button key="next" disabled={Boolean(missing)} aria-describedby={missing ? 'step-help' : undefined} onClick={() => form.setStep((step + 1) as FormStep)}>{t('next')}</Button>
          : <Button key="send" disabled={busy || Boolean(missing)} aria-busy={sending} aria-describedby={missing ? 'step-help' : undefined} onClick={form.sendRequest}>{sending ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden /> : <Send className="ss-flip" aria-hidden />}{t(sending ? 'form.sending' : 'form.send')}</Button>}
      </div>
      {missing && <p className="ss-hint" id="step-help">{missing}</p>}
    </Card>
  );
}

/** C3: whose turn it is, and a way to back out (with confirmation). */
function WaitingCard({ m }: { m: StitchSureModel }) {
  const { state, customer, busy } = m;
  const r = state.request!;
  return (
    <Card title={t('waiting.title')} focusTarget className="ss-narrow" aside={<Chip status="Waiting for the tailor" />}>
      <p className="ss-ask"><span>{t(`part.${r.part}`)}:</span> {term(r.part === 'Sleeve' ? state.sleeve : state.neckline)} → <strong>{term(requestedLabel(r))}</strong></p>
      <p className="ss-meta">{r.note ? t('waiting.note', { note: r.note }) : t('waiting.noNote')}{r.reference ? ` · ${t('waiting.photo')}` : ''}</p>
      {r.answer && <p className="ss-meta">{t('waiting.reply', { answer: r.answer })}</p>}
      <Notice tone="info">{t('waiting.same', { version: state.version })}</Notice>
      <ErrorSlot state={state} />
      {/* A safe control comes first in the Tab order, before anything destructive (D5A S-04). */}
      <Disclosure label={t('waiting.nextLabel')}><p className="ss-meta">{t('waiting.nextText')}</p></Disclosure>
      <SeeOrder m={m} />
      {!customer.confirmCancel
        ? <div className="ss-actions"><Button variant="outline" disabled={busy} onClick={() => customer.setConfirmCancel(true)}><X aria-hidden />{t('cancel.button')}</Button></div>
        : <div className="ss-confirm-box" role="group" aria-labelledby="cancel-q">
            <p id="cancel-q"><strong>{t('cancel.question')}</strong> {t('cancel.same')}</p>
            <div className="ss-actions">
              <Button variant="outline" autoFocus onClick={() => customer.setConfirmCancel(false)}>{t('cancel.no')}</Button>
              <Button variant="outline" onClick={customer.cancelRequest}>{t('cancel.yes')}</Button>
            </div>
          </div>}
    </Card>
  );
}

/** C1-Q: the tailor's question, answered in place (critique rows 10, 11). */
function QuestionCard({ m }: { m: StitchSureModel }) {
  const { state, customer, busy } = m;
  const r = state.request!;
  return (
    <Card title={t('question.title')} focusTarget className="ss-narrow" aside={<Chip status="Waiting for you" />}>
      <blockquote className="ss-quote">“{r.reason}”</blockquote>
      <p className="ss-meta">{t('question.about', { part: t(`part.${r.part}`), style: term(requestedLabel(r)) })}</p>
      <Field label={t('question.answer')} htmlFor="req-answer"><Textarea id="req-answer" rows={3} value={customer.answer} onChange={e => customer.setAnswer(e.target.value)} placeholder={t('question.placeholder')} /></Field>
      <ErrorSlot state={state} />
      <div className="ss-actions"><Button disabled={busy} onClick={customer.sendAnswer}><Send className="ss-flip" aria-hidden />{t('question.reply')}</Button></div>
      <SeeOrder m={m} />
    </Card>
  );
}

/** C4: both choices carry equal weight (row 16); plain words (rows 19, 25); a preview of the offer (row 3). */
function DecisionCard({ m }: { m: StitchSureModel }) {
  const { state, decide, busy } = m;
  const r = state.request!;
  const impossible = r.outcome === 'Impossible';
  const offer = impossible ? r.alternative ?? '' : requestedLabel(r);
  const unchanged = /unchanged/i.test(r.date ?? '');
  return (
    <Card title={t('decision.title')} focusTarget className="ss-narrow" aside={<Chip status="Waiting for you" />}>
      {impossible && (
        <div className="ss-offer ss-offer-no">
          <span className="ss-eyebrow">{t('decision.asked')}</span>
          <h3><s>{term(requestedLabel(r))}</s></h3>
          <Chip status="Cannot be made" />
          {r.reason && <p>{r.reason}</p>}
        </div>
      )}
      <div className="ss-offer ss-offer-yes">
        <span className="ss-eyebrow">{t(impossible ? 'decision.other' : 'decision.confirms')}</span>
        <h3>{term(offer)}</h3>
        <Chip status="Can be made" />
        {!impossible && r.reason && <p>{r.reason}</p>}
        <figure className="ss-offer-preview"><Garment small sleeve={r.part === 'Sleeve' ? offer : state.sleeve} neckline={r.part === 'Neckline' ? offer : state.neckline} part={r.part} /><figcaption>{t('decision.preview', { style: term(offer) })}</figcaption></figure>
        <dl className="ss-effects">
          <div><dt>{t('decision.cost')}</dt><dd>{r.cost}</dd></div>
          <div><dt>{t('decision.dateChange')}</dt><dd>{unchanged ? t('fact.none') : r.date}</dd></div>
        </dl>
        {unchanged && <p className="ss-hint">{t('decision.stillReady', { event: term(ORDER.event), date: ORDER.eventDate })}</p>}
      </div>
      <ErrorSlot state={state} />
      <div className="ss-equal">
        <div><Button variant="outline" disabled={busy} onClick={decide.keepOriginal}>{t('decision.keep')}</Button><p className="ss-hint">{t('decision.keep.help', { version: state.version })}</p></div>
        <div><Button variant="outline" disabled={busy} onClick={decide.approve}><Check aria-hidden />{t('decision.approve', { style: term(offer) })}</Button><p className="ss-hint">{t('decision.approve.help', { style: term(offer), version: state.version + 1 })}</p></div>
      </div>
      <SeeOrder m={m} />
    </Card>
  );
}

/** C5: confirmation, a summary, and a clearly bounded undo (rows 5, 26). */
function ApprovedCard({ m }: { m: StitchSureModel }) {
  const { state, customer, decide, busy } = m;
  const design = state.request?.part === 'Neckline' ? state.neckline : state.sleeve;
  return (
    <Card title={t('approved.title', { style: term(design) })} focusTarget className="ss-narrow" aside={<Chip status="Approved" />}>
      <Notice tone="ok">{t('approved.notice', { version: state.version, old: state.version - 1 })}</Notice>
      <p className="ss-gap"><strong>{t('approved.design')}</strong> {term(state.sleeve)} · {term(state.neckline)} · {t('order.due', { date: ORDER.delivery })}</p>
      <p className="ss-meta">{t(state.stitching ? 'approved.started' : 'approved.notStarted')}</p>
      <ErrorSlot state={state} />
      <div className="ss-actions">
        <Button onClick={() => { customer.setShowApproved(false); customer.go('home'); }}>{t('back.choices')}</Button>
        <Button variant="outline" disabled={busy || state.stitching} onClick={decide.undoApproval}><Undo2 className="ss-flip" aria-hidden />{t('undo.button')}</Button>
      </div>
      <p className="ss-hint">{t(state.stitching ? 'approved.undoGone' : 'approved.undoUntil')}</p>
    </Card>
  );
}
