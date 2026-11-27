import { useState, type ReactNode } from 'react';
import { ArrowLeft, Check, ChevronRight, LoaderCircle, Send, Upload, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CUSTOMER, NOTE_PLACEHOLDER, ORDER, PART_LABEL, styleOptions } from '@/lib/sample';
import { DESCRIBED, requestedLabel } from '@/lib/workflow';
import { Card, Chip, Disclosure, ErrorSlot, Facts, Field, Notice, OptionList, Segmented, UndoNotice } from './ui';
import { Garment } from './Garment';
import type { StitchSureModel } from './useStitchSure';

/** Customer portal. Which card shows depends on whose turn it is, so there is always one clear next step. */
export function CustomerView({ m }: { m: StitchSureModel }) {
  const { state, customer } = m;
  const r = state.request;
  const pending = r?.status === 'Pending';
  let action: ReactNode;
  if (pending && !r.outcome) action = <WaitingCard m={m} />;
  else if (pending && r.outcome === 'Needs clarification') action = <QuestionCard m={m} />;
  else if (pending) action = <DecisionCard m={m} />;
  else if (customer.showApproved && r?.status === 'Approved') action = <ApprovedCard m={m} />;
  else if (customer.screen === 'form') action = <RequestForm m={m} />;
  else action = <HistoryCard m={m} />;
  // The next step comes first; on the order home, the order itself does (visibility of the next action).
  const home = customer.screen === 'home' && !pending && !(customer.showApproved && r?.status === 'Approved');
  return (
    <div className="ss-split">
      {home ? <div className="ss-split-home"><OrderCard m={m} />{action}</div>
            : <><div className="ss-col ss-col-act">{action}</div><div className="ss-col"><OrderCard m={m} /></div></>}
    </div>
  );
}

/** C1 / C6 / C7: the order and its design details, with the one main action. */
function OrderCard({ m }: { m: StitchSureModel }) {
  const { state, customer, form, busy } = m;
  const [showMeasure, setShowMeasure] = useState(false);
  const r = state.request;
  const home = customer.screen === 'home' && r?.status !== 'Pending' && !(customer.showApproved && r?.status === 'Approved');
  const locked = state.stitching || state.paused;
  const selecting = customer.screen === 'form' && !r?.outcome && r?.status !== 'Pending';
  return (
    <Card title="Your order" focusTarget={home} className="ss-ordercard" aside={<Chip status={`Agreed · Version ${state.version}`} />}>
      {home && state.undo && !state.stitching && !state.finished && <UndoNotice disabled={busy} onUndo={m.decide.undoApproval} />}
      {r?.status === 'Rejected' && home && <Notice tone="ok">Tailor notified: original design kept.</Notice>}
      <div className="ss-order-body">
      <div className="ss-order-pic">
        <Garment sleeve={state.sleeve} neckline={state.neckline} part={selecting ? form.part : ''} select={selecting ? form.choosePart : undefined} />
        {selecting && <p className="ss-hint ss-center">Tap the sleeve or neckline, or use the buttons.</p>}
      </div>
      <div className="ss-order-info">
      <h3 className="ss-subhead">Design details</h3>
      <Facts label="Design details" rows={[
        { label: 'Sleeve style', value: state.sleeve },
        { label: 'Neckline style', value: state.neckline },
        { label: 'Fabric', value: ORDER.fabric },
        { label: 'Reference picture', value: r?.reference && r.status === 'Approved' ? 'reference.jpg (sample)' : 'None' },
        { label: 'Design note', value: r?.status === 'Approved' && r.note ? `“${r.note}”` : 'None' },
        { label: 'Due', value: ORDER.delivery },
        { label: 'Needed for', value: `${ORDER.event}, ${ORDER.eventDate}` },
      ]} />
      <Button variant="link" className="ss-link" aria-expanded={showMeasure} onClick={() => setShowMeasure(v => !v)}>Measurements<ChevronRight className={showMeasure ? 'rotate-90' : ''} aria-hidden /></Button>
      {showMeasure && <Facts label="Measurements" rows={CUSTOMER.measurements.map(x => ({ label: x.label, value: x.value }))} />}
      {home && (
        <div className="ss-actions">
          <Button disabled={busy || locked} onClick={customer.openForm}>Request a change</Button>
          {locked && <p className="ss-hint">Stitching has started, so changes now go through Master Mahad.</p>}
        </div>
      )}
      </div>
      </div>
    </Card>
  );
}

/** History and problems: earlier versions with dates, and declined suggestions (critique rows 20, 23). */
function HistoryCard({ m }: { m: StitchSureModel }) {
  const { state } = m;
  const [open, setOpen] = useState<'' | 'earlier' | 'declined'>('');
  const [report, setReport] = useState(false);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const earlier = state.events.filter(e => e.status === 'Superseded');
  return (
    <Card title="History and problems">
      <ul className="ss-history">
        <li>
          <button type="button" aria-expanded={open === 'earlier'} onClick={() => setOpen(open === 'earlier' ? '' : 'earlier')}><ChevronRight className={open === 'earlier' ? 'rotate-90' : ''} aria-hidden />Earlier versions ({earlier.length})</button>
          {open === 'earlier' && (earlier.length ? <ul>{earlier.map(e => <li key={e.at}><s>{e.title}</s> <span className="ss-meta">· {e.text} · replaced</span></li>)}</ul> : <p className="ss-meta">No earlier versions yet.</p>)}
        </li>
        <li>
          <button type="button" aria-expanded={open === 'declined'} onClick={() => setOpen(open === 'declined' ? '' : 'declined')}><ChevronRight className={open === 'declined' ? 'rotate-90' : ''} aria-hidden />Declined suggestions ({state.declined.length})</button>
          {open === 'declined' && (state.declined.length ? <ul>{state.declined.map(d => <li key={d}>{d}</li>)}</ul> : <p className="ss-meta">Nothing declined yet.</p>)}
        </li>
      </ul>
      <Button variant="link" className="ss-link" aria-expanded={report} onClick={() => { setReport(v => !v); setSent(false); }}>Report a problem<ChevronRight className={report ? 'rotate-90' : ''} aria-hidden /></Button>
      {report && (sent
        ? <Notice tone="ok" role="status">Sent to Master Mahad. He will reply in StitchSure.</Notice>
        : <div className="ss-conflict">
            <Field label="What is wrong with your order?" htmlFor="cust-problem" hint="Master Mahad reads this in StitchSure."><Textarea id="cust-problem" rows={3} value={text} onChange={e => setText(e.target.value)} /></Field>
            <Button variant="outline" disabled={!text.trim()} onClick={() => setSent(true)}><Send />Send to Master Mahad</Button>
          </div>)}
    </Card>
  );
}

/** C2 / C2-N / C-E1 */
function RequestForm({ m }: { m: StitchSureModel }) {
  const { state, form, customer, sending, busy } = m;
  const current = form.part === 'Sleeve' ? state.sleeve : form.part === 'Neckline' ? state.neckline : '';
  const ready = !!form.part && !!form.style;
  const described = form.style === DESCRIBED;
  const styleError = !!state.error && /style/i.test(state.error);
  return (
    <Card title="Request a change" focusTarget aside={<Button variant="link" className="ss-link" onClick={customer.backToOrder}><ArrowLeft aria-hidden />Back to order</Button>}>
      <ErrorSlot state={state} />
      <Segmented legend="1. Which part?" value={form.part} options={[{ value: 'Sleeve', label: PART_LABEL.Sleeve }, { value: 'Neckline', label: PART_LABEL.Neckline }]} onChange={form.choosePart} />
      {form.part
        ? <div className={styleError ? 'ss-error-group' : undefined}><OptionList legend="2. Which style?" value={form.style} options={styleOptions(form.part, current)} onChange={form.chooseStyle} /></div>
        : <p className="ss-hint">Choose a part first. Its styles appear here.</p>}
      <Field label={described ? '3. Note (needed: describe the style)' : '3. Note (optional)'} htmlFor="req-note"><Textarea id="req-note" rows={3} value={form.note} onChange={e => form.setNote(e.target.value)} placeholder={NOTE_PLACEHOLDER[form.part]} /></Field>
      <div className="ss-attach">
        <Button variant="outline" disabled={busy} onClick={form.toggleReference}>{form.reference ? <Check /> : <Upload />}{form.reference ? 'Remove reference' : 'Add reference'}</Button>
        <span className="ss-meta">{form.reference ? 'reference.jpg · sample photo' : 'Optional · sample upload'}</span>
      </div>
      {ready && <div className="ss-preview"><span>You are asking for</span><p><strong>{form.part}: {current} → {described ? `as described: “${form.note || '…'}”` : form.style}</strong>. Nothing changes until Master Mahad and you both agree.</p></div>}
      <div className="ss-actions">
        <Button disabled={busy} onClick={form.sendRequest} aria-busy={sending}>{sending ? <LoaderCircle className="motion-safe:animate-spin" /> : <Send />}{sending ? 'Sending…' : 'Send request'}</Button>
      </div>
    </Card>
  );
}

/** C3: whose turn it is, and a way to back out (with confirmation). */
function WaitingCard({ m }: { m: StitchSureModel }) {
  const { state, customer, busy } = m;
  const r = state.request!;
  return (
    <Card title="Your request" focusTarget aside={<Chip status="Waiting for the tailor" />}>
      <p className="ss-ask"><span>{PART_LABEL[r.part]}</span> {r.part === 'Sleeve' ? state.sleeve : state.neckline} → <strong>{requestedLabel(r)}</strong></p>
      <p className="ss-meta">{r.note ? `Note: “${r.note}”` : 'No note added.'}{r.reference ? ' · Reference photo attached' : ''}</p>
      {r.answer && <p className="ss-meta">Your reply: “{r.answer}”</p>}
      <Notice tone="info">Your agreed design (Version {state.version}) stays the same. Nothing is stitched from your request until you both agree.</Notice>
      <ErrorSlot state={state} />
      <Disclosure label="What happens next">
        <p className="ss-meta">Master Mahad checks whether it can be made, and what it changes in cost and delivery. Then you approve it or keep your agreed design.</p>
      </Disclosure>
      {!customer.confirmCancel
        ? <div className="ss-actions"><Button variant="outline" disabled={busy} onClick={() => customer.setConfirmCancel(true)}><X />Cancel request</Button></div>
        : <div className="ss-confirm-box" role="group" aria-labelledby="cancel-q">
            <p id="cancel-q"><strong>Cancel this request?</strong> Your agreed design stays the same.</p>
            <div className="ss-actions">
              <Button variant="outline" autoFocus onClick={() => customer.setConfirmCancel(false)}>No, keep request</Button>
              <Button variant="outline" onClick={customer.cancelRequest}>Yes, cancel</Button>
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
    <Card title="Master Mahad asked" focusTarget aside={<Chip status="Waiting for you" />}>
      <blockquote className="ss-quote">“{r.reason}”</blockquote>
      <p className="ss-meta">About your request: {PART_LABEL[r.part]} → {requestedLabel(r)}</p>
      <Field label="Your answer" htmlFor="req-answer"><Textarea id="req-answer" rows={3} value={customer.answer} onChange={e => customer.setAnswer(e.target.value)} placeholder="e.g. 22 inches, same as before" /></Field>
      <ErrorSlot state={state} />
      <div className="ss-actions"><Button disabled={busy} onClick={customer.sendAnswer}><Send />Reply</Button></div>
    </Card>
  );
}

/** C4: both choices carry equal weight (row 16); plain words (rows 19, 25); a preview of the offer (row 3). */
function DecisionCard({ m }: { m: StitchSureModel }) {
  const { state, decide, busy } = m;
  const r = state.request!;
  const impossible = r.outcome === 'Impossible';
  const offer = impossible ? r.alternative ?? '' : requestedLabel(r);
  const now = r.part === 'Sleeve' ? state.sleeve : state.neckline;
  return (
    <Card title="Choose an option" focusTarget aside={<Chip status="Waiting for you" />}>
      <p className="ss-meta">{PART_LABEL[r.part]}: {now} → {offer}</p>
      <div className="ss-options-pair">
        <div className={impossible ? 'ss-offer ss-offer-no' : 'ss-offer'}>
          <span className="ss-eyebrow">You asked for</span>
          <h3>{impossible ? <s>{requestedLabel(r)}</s> : requestedLabel(r)}</h3>
          <Chip status={impossible ? 'Cannot be made' : 'Can be made'} />
          {r.reason && <p>{r.reason}</p>}
        </div>
        <div className="ss-offer ss-offer-yes">
          <span className="ss-eyebrow">{impossible ? 'Other options from the tailor' : 'Tailor confirms'}</span>
          <h3>{offer}</h3>
          <Chip status="Can be made" />
          <figure className="ss-offer-preview"><Garment small sleeve={r.part === 'Sleeve' ? offer : state.sleeve} neckline={r.part === 'Neckline' ? offer : state.neckline} part={r.part} /><figcaption>Preview: {offer}</figcaption></figure>
          <dl className="ss-effects"><div><dt>Cost</dt><dd>{r.cost}</dd></div><div><dt>Delivery date change</dt><dd>{/unchanged/i.test(r.date ?? '') ? 'None' : r.date}</dd></div></dl>
          {/unchanged/i.test(r.date ?? '') && <p className="ss-hint">Still ready before {ORDER.event} ({ORDER.eventDate}).</p>}
        </div>
      </div>
      <ErrorSlot state={state} />
      <div className="ss-equal">
        <div><Button variant="outline" disabled={busy} onClick={decide.keepOriginal}>Keep my original design</Button><p className="ss-hint">Your order continues with your agreed design (Version {state.version}). The tailor will be told.</p></div>
        <div><Button variant="outline" disabled={busy} onClick={decide.approve}><Check />Approve {offer}</Button><p className="ss-hint">{offer} becomes your agreed design (Version {state.version + 1}). You can undo until the worker starts.</p></div>
      </div>
    </Card>
  );
}

/** C5: confirmation, a summary, and a clearly bounded undo (rows 5, 26). */
function ApprovedCard({ m }: { m: StitchSureModel }) {
  const { state, customer, decide, busy } = m;
  return (
    <Card title={`${state.request?.part === 'Sleeve' ? state.sleeve : state.neckline} approved`} focusTarget aside={<Chip status="Approved" />}>
      <Notice tone="ok">This is now your agreed design (Version {state.version}). The worker can see it. Your old design (Version {state.version - 1}) is replaced.</Notice>
      <p><strong>Your agreed design:</strong> {state.sleeve} · {state.neckline} · Due {ORDER.delivery}</p>
      <p className="ss-meta">{state.stitching ? 'The worker has started stitching.' : 'The worker has not started yet.'}</p>
      <ErrorSlot state={state} />
      <div className="ss-actions">
        <Button onClick={() => customer.setShowApproved(false)}>Back to my orders</Button>
        <Button variant="outline" disabled={busy || state.stitching} onClick={decide.undoApproval}><Undo2 />Undo approval</Button>
      </div>
      <p className="ss-hint">{state.stitching ? 'Undo is no longer available because stitching has started.' : 'Undo is available until the worker starts stitching.'}</p>
    </Card>
  );
}
