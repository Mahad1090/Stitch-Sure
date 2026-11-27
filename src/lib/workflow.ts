import { render, type Msg } from './i18n';

export type Role = 'customer' | 'tailor' | 'worker';
export type Part = 'Sleeve' | 'Neckline';
export type ProductionStage = 'Not cut' | 'Cut' | 'Stitching';
export type Outcome = 'Possible' | 'Impossible' | 'Needs clarification';
/** The style value used when the customer describes the change in their note instead of picking a listed style. */
export const DESCRIBED = 'As described in my note';
export type Request = { part: Part; style: string; note: string; reference: boolean; status: 'Pending' | 'Approved' | 'Rejected'; seen: boolean; outcome?: Outcome; reason?: string; alternative?: string; cost?: string; date?: string; answer?: string };
/** The design the customer asked for, in words people can act on. For a described style that is their own note. */
export function requestedLabel(request: Pick<Request, 'style' | 'note'>): string {
  return request.style === DESCRIBED ? request.note.trim() : request.style;
}
/** `title` and `text` are the English record; `msg` is the same entry as translatable data. */
export type Event = { title: string; text: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Superseded'; at: string; msg?: { title: Msg; text: Msg } | undefined };
/** What approval replaced, kept so the customer can undo until the worker starts. */
type Snapshot = { version: number; sleeve: string; neckline: string; request: Request; events: Event[]; declined: string[]; declinedMsgs: Msg[] };
export type Workflow = {
  stage: ProductionStage; version: number; sleeve: string; neckline: string; request?: Request | undefined;
  acknowledged: boolean; stitching: boolean; finished: boolean; paused: boolean;
  events: Event[]; declined: string[]; declinedMsgs: Msg[]; undo?: Snapshot | undefined; approvedAt: string; message: string; error: string;
  messageMsg?: Msg | undefined; errorMsg?: Msg | undefined;
};
const entry = (status: Event['status'], title: Msg, text: Msg, at: string): Event => ({ title: render(title), text: render(text), status, at, msg: { title, text } });
const note = (message: Msg) => ({ message: render(message), messageMsg: message });
const quote = (text: string): Msg => ({ key: 'event.plain', vars: { text } });

export const initialWorkflow: Workflow = {
  stage: 'Cut', version: 1, sleeve: 'Straight sleeve', neckline: 'Round neckline',
  acknowledged: false, stitching: false, finished: false, paused: false,
  events: [entry('Approved', { key: 'event.original.title' }, { key: 'event.pair', vars: { first: { term: 'Straight sleeve' }, second: { term: 'Round neckline' } } }, 'Oct 26, 2026, 10:00')],
  declined: [], declinedMsgs: [], approvedAt: 'Oct 26, 2026', message: '', error: '',
};
export type Action =
  | { type: 'request'; part: Part | ''; style: string; note: string; reference: boolean; at: string }
  | { type: 'cancel'; at: string }
  | { type: 'seen' }
  | { type: 'stage'; stage: ProductionStage }
  | { type: 'review'; outcome: Outcome; reason: string; alternative: string; cost: string; date: string; at: string }
  | { type: 'answer'; text: string; at: string }
  | { type: 'approve'; at: string }
  | { type: 'undo'; at: string }
  | { type: 'reject'; at: string }
  | { type: 'acknowledge'; value: boolean }
  | { type: 'start' }
  | { type: 'finish'; at: string }
  | { type: 'conflict'; kind: string; reason: string; at: string }
  | { type: 'resolve'; at: string }
  | { type: 'reset' };

const dateOnly = (at: string) => at.split(',').slice(0, 2).join(',');

export function workflowReducer(state: Workflow, action: Action): Workflow {
  const fail = (key: Extract<Msg['key'], `error.${string}`>) => ({ ...state, error: render({ key }), errorMsg: { key }, message: '', messageMsg: undefined });
  const base = { ...state, error: '', errorMsg: undefined, message: '', messageMsg: undefined };
  switch (action.type) {
    case 'reset': return initialWorkflow;
    case 'request': {
      if (!action.part) return fail('error.noPart');
      if (!action.style) return fail('error.noStyle');
      if (action.style === DESCRIBED && !action.note.trim()) return fail('error.noNote');
      if (state.request?.status === 'Pending') return fail('error.alreadyPending');
      if (state.stitching || state.paused) return fail('error.locked');
      const text: Msg = action.style === DESCRIBED ? { key: 'event.quote', vars: { note: action.note.trim() } }
        : action.note ? { key: 'event.styleNote', vars: { style: { term: action.style }, note: action.note } }
        : { key: 'event.plain', vars: { text: { term: action.style } } };
      return { ...base, request: { part: action.part, style: action.style, note: action.note, reference: action.reference, status: 'Pending', seen: false }, acknowledged: false, undo: undefined, ...note({ key: 'msg.requestSent' }), events: [...state.events, entry('Pending', { key: 'event.requested.title', vars: { part: { term: action.part } } }, text, action.at)] };
    }
    case 'cancel': {
      const r = state.request;
      if (!r || r.status !== 'Pending' || (r.outcome && r.outcome !== 'Needs clarification')) return fail('error.cannotCancel');
      return { ...base, request: undefined, ...note({ key: 'msg.cancelled', vars: { version: state.version } }), events: [...state.events, entry('Rejected', { key: 'event.cancelled.title' }, { key: 'event.partStyle', vars: { part: { term: r.part }, style: { term: requestedLabel(r) } } }, action.at)] };
    }
    case 'seen': return state.request?.status === 'Pending' ? { ...base, request: { ...state.request, seen: true } } : state;
    case 'stage': return { ...base, stage: action.stage, ...note({ key: 'msg.stage', vars: { stage: { term: action.stage } } }) };
    case 'review': {
      if (!state.request || state.request.status !== 'Pending') return fail('error.noRequestToReview');
      if (action.outcome === 'Impossible' && (!action.reason.trim() || !action.alternative.trim())) return fail('error.needReason');
      if (action.outcome === 'Needs clarification' && !action.reason.trim()) return fail('error.needQuestion');
      if (state.stage !== 'Not cut' && state.request.style === 'Bell sleeves' && action.outcome === 'Possible') return fail('error.fabricCut');
      if (action.outcome !== 'Needs clarification' && (!action.cost.trim() || !action.date.trim())) return fail('error.needCost');
      const question = action.outcome === 'Needs clarification';
      const review: Msg = { key: 'event.review.text', vars: {
        verdict: { msg: { key: action.outcome === 'Impossible' ? 'outcome.Impossible' : 'outcome.Possible' } },
        reason: action.reason || { msg: { key: 'event.review.possible' } },
        offer: action.alternative ? { msg: { key: 'event.review.offer', vars: { alternative: { term: action.alternative } } } } : '',
      } };
      return { ...base, request: { ...state.request, seen: true, outcome: action.outcome, reason: action.reason, alternative: action.alternative, cost: action.cost, date: action.date }, ...note({ key: question ? 'msg.questionSent' : 'msg.reviewSent' }), events: [...state.events, entry('Pending', { key: question ? 'event.asked.title' : 'event.review.title' }, question ? quote(action.reason) : review, action.at)] };
    }
    case 'answer': {
      const r = state.request;
      if (!r || r.status !== 'Pending' || r.outcome !== 'Needs clarification') return fail('error.noQuestion');
      if (!action.text.trim()) return fail('error.noAnswer');
      const { outcome: _o, reason: _r, alternative: _a, cost: _c, date: _d, ...rest } = r;
      return { ...base, request: { ...rest, answer: action.text, seen: false }, ...note({ key: 'msg.replySent' }), events: [...state.events, entry('Pending', { key: 'event.replied.title' }, quote(action.text), action.at)] };
    }
    case 'approve': {
      const r = state.request;
      if (!r || r.status !== 'Pending' || !r.outcome || r.outcome === 'Needs clarification') return fail('error.waitForTailor');
      const design = r.outcome === 'Impossible' ? r.alternative : requestedLabel(r);
      if (!design) return fail('error.needDesign');
      const v = state.version + 1;
      const refused: Msg[] = r.outcome === 'Impossible' ? [{ key: 'declined.impossible', vars: { design: { term: requestedLabel(r) }, date: dateOnly(action.at) } }] : [];
      return { ...base, version: v, sleeve: r.part === 'Sleeve' ? design : state.sleeve, neckline: r.part === 'Neckline' ? design : state.neckline, request: { ...r, status: 'Approved' }, acknowledged: false, approvedAt: dateOnly(action.at), undo: { version: state.version, sleeve: state.sleeve, neckline: state.neckline, request: r, events: state.events, declined: state.declined, declinedMsgs: state.declinedMsgs }, declined: [...state.declined, ...refused.map(m => render(m))], declinedMsgs: [...state.declinedMsgs, ...refused], ...note({ key: 'msg.approved', vars: { design: { term: design }, version: v } }), events: [...state.events.map(e => e.status === 'Approved' ? { ...e, status: 'Superseded' as const } : e), entry('Approved', { key: 'event.approved.title', vars: { version: v } }, { key: 'event.approved.text', vars: { part: { term: r.part }, design: { term: design }, cost: r.cost ?? '', date: r.date ?? '' } }, action.at)] };
    }
    case 'undo': {
      if (!state.undo) return fail('error.nothingToUndo');
      if (state.stitching || state.finished) return fail('error.undoTooLate');
      const u = state.undo;
      return { ...base, version: u.version, sleeve: u.sleeve, neckline: u.neckline, request: u.request, declined: u.declined, declinedMsgs: u.declinedMsgs, acknowledged: false, undo: undefined, ...note({ key: 'msg.undone', vars: { version: u.version } }), events: [...u.events, entry('Pending', { key: 'event.undone.title' }, { key: 'event.undone.text', vars: { version: u.version } }, action.at)] };
    }
    case 'reject': {
      const r = state.request;
      if (r?.status !== 'Pending') return fail('error.nothingToDecline');
      const declined = r.outcome === 'Impossible' ? r.alternative ?? requestedLabel(r) : requestedLabel(r);
      const refused: Msg = { key: 'declined.declined', vars: { design: { term: declined }, date: dateOnly(action.at) } };
      return { ...base, request: { ...r, status: 'Rejected' }, declined: [...state.declined, render(refused)], declinedMsgs: [...state.declinedMsgs, refused], ...note({ key: 'msg.keptOriginal' }), events: [...state.events, entry('Rejected', { key: 'event.rejected.title' }, { key: 'event.rejected.text', vars: { design: { term: declined }, version: state.version } }, action.at)] };
    }
    case 'acknowledge': return { ...base, acknowledged: action.value };
    case 'start': {
      if (!state.acknowledged) return fail('error.notRead');
      if (state.request?.status === 'Pending') return fail('error.changePending');
      if (state.paused) return fail('error.onHold');
      return { ...base, stitching: true, stage: 'Stitching', undo: undefined, ...note({ key: 'msg.started', vars: { version: state.version } }) };
    }
    case 'finish': {
      if (!state.stitching) return fail('error.notStarted');
      return { ...base, finished: true, ...note({ key: 'msg.finished' }), events: [...state.events, entry('Approved', { key: 'event.finished.title' }, { key: 'version.n', vars: { version: state.version } }, action.at)] };
    }
    case 'resolve': return state.paused ? { ...base, paused: false, ...note({ key: 'msg.solved' }), events: [...state.events, entry('Approved', { key: 'event.solved.title' }, { key: 'event.solved.text' }, action.at)] } : state;
    case 'conflict': {
      if (!action.kind) return fail('error.noKind');
      if (!action.reason.trim()) return fail('error.noProblem');
      return { ...base, paused: true, acknowledged: false, ...note({ key: 'msg.reported' }), events: [...state.events, entry('Pending', { key: 'event.reported.title' }, { key: 'event.pair', vars: { first: { term: action.kind }, second: action.reason } }, action.at)] };
    }
  }
}
