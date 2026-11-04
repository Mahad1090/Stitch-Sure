export type Role = 'customer' | 'tailor' | 'worker';
export type Part = 'Sleeve' | 'Neckline';
export type ProductionStage = 'Not cut' | 'Cut' | 'Stitching';
export type Outcome = 'Possible' | 'Impossible' | 'Needs clarification';
/** The style value used when the customer describes the change in their note instead of picking a listed style. */
export const DESCRIBED = 'As described in my note';
export type Request = { part: Part; style: string; note: string; reference: boolean; status: 'Pending' | 'Approved' | 'Rejected'; seen: boolean; outcome?: Outcome; reason?: string; alternative?: string; cost?: string; date?: string; answer?: string };
export type Event = { title: string; text: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Superseded'; at: string };
/** What approval replaced, kept so the customer can undo until the worker starts. */
type Snapshot = { version: number; sleeve: string; neckline: string; request: Request; events: Event[]; declined: string[] };
export type Workflow = {
  stage: ProductionStage; version: number; sleeve: string; neckline: string; request?: Request | undefined;
  acknowledged: boolean; stitching: boolean; finished: boolean; paused: boolean;
  events: Event[]; declined: string[]; undo?: Snapshot | undefined; approvedAt: string; message: string; error: string;
};
export const initialWorkflow: Workflow = {
  stage: 'Cut', version: 1, sleeve: 'Straight sleeve', neckline: 'Round neckline',
  acknowledged: false, stitching: false, finished: false, paused: false,
  events: [{ title: 'Version 1 · Original design', text: 'Straight sleeve · Round neckline', status: 'Approved', at: 'Oct 26, 2026, 10:00' }],
  declined: [], approvedAt: 'Oct 26, 2026', message: '', error: '',
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
  const fail = (error: string) => ({ ...state, error, message: '' });
  const base = { ...state, error: '', message: '' };
  switch (action.type) {
    case 'reset': return initialWorkflow;
    case 'request': {
      if (!action.part) return fail('Choose which part to change, then send again. Your note is kept.');
      if (!action.style) return fail('Choose a style, or pick “As described in my note”. Your note is kept.');
      if (action.style === DESCRIBED && !action.note.trim()) return fail('Describe the style you want in the note, or choose a listed style. Your choices are kept.');
      if (state.request?.status === 'Pending') return fail('You already have a request waiting. Cancel it or wait for the tailor before sending another.');
      if (state.stitching || state.paused) return fail('Stitching has started. Ask the tailor before requesting another change.');
      return { ...base, request: { part: action.part, style: action.style, note: action.note, reference: action.reference, status: 'Pending', seen: false }, acknowledged: false, undo: undefined, message: 'Request sent to Master Mahad.', events: [...state.events, { title: `${action.part} change requested`, text: `${action.style}${action.note ? ` · “${action.note}”` : ''}`, status: 'Pending', at: action.at }] };
    }
    case 'cancel': {
      const r = state.request;
      if (!r || r.status !== 'Pending' || (r.outcome && r.outcome !== 'Needs clarification')) return fail('This request can no longer be cancelled here. Choose an option instead.');
      return { ...base, request: undefined, message: `Request cancelled. Your agreed design (Version ${state.version}) stays the same.`, events: [...state.events, { title: 'Customer cancelled the request', text: `${r.part}: ${r.style}`, status: 'Rejected', at: action.at }] };
    }
    case 'seen': return state.request?.status === 'Pending' ? { ...base, request: { ...state.request, seen: true } } : state;
    case 'stage': return { ...base, stage: action.stage, message: `Production stage set to ${action.stage}.` };
    case 'review': {
      if (!state.request || state.request.status !== 'Pending') return fail('Open a waiting customer request first.');
      if (action.outcome === 'Impossible' && (!action.reason.trim() || !action.alternative.trim())) return fail('Add why it cannot be made and one design you can offer instead, then send again. Your entries are kept.');
      if (action.outcome === 'Needs clarification' && !action.reason.trim()) return fail('Type the question you need the customer to answer, then send again.');
      if (state.stage !== 'Not cut' && state.request.style === 'Bell sleeves' && action.outcome === 'Possible') return fail('Fabric is already cut. Bell sleeves can’t be made. Mark “Cannot be made” and offer Cuff Trim. Your entries are kept.');
      if (action.outcome !== 'Needs clarification' && (!action.cost.trim() || !action.date.trim())) return fail('Enter the cost and delivery effect before sending. Your entries are kept.');
      const question = action.outcome === 'Needs clarification';
      return { ...base, request: { ...state.request, seen: true, outcome: action.outcome, reason: action.reason, alternative: action.alternative, cost: action.cost, date: action.date }, message: question ? 'Question sent to Areeba.' : 'Review sent to Areeba. The request stays open until she decides.', events: [...state.events, { title: question ? 'Tailor asked a question' : 'Tailor review', text: question ? action.reason : `${action.outcome === 'Impossible' ? 'Cannot be made' : 'Can be made'} · ${action.reason || 'Requested design is possible'}${action.alternative ? ` · Offer: ${action.alternative}` : ''}`, status: 'Pending', at: action.at }] };
    }
    case 'answer': {
      const r = state.request;
      if (!r || r.status !== 'Pending' || r.outcome !== 'Needs clarification') return fail('There is no question waiting for you.');
      if (!action.text.trim()) return fail('Type your answer, then send it.');
      const { outcome: _o, reason: _r, alternative: _a, cost: _c, date: _d, ...rest } = r;
      return { ...base, request: { ...rest, answer: action.text, seen: false }, message: 'Reply sent to Master Mahad.', events: [...state.events, { title: 'Customer replied', text: action.text, status: 'Pending', at: action.at }] };
    }
    case 'approve': {
      const r = state.request;
      if (!r || r.status !== 'Pending' || !r.outcome || r.outcome === 'Needs clarification') return fail('Wait for the tailor’s answer before approving.');
      const design = r.outcome === 'Impossible' ? r.alternative : r.style;
      if (!design) return fail('A design that can be made is needed before approval.');
      const v = state.version + 1;
      return { ...base, version: v, sleeve: r.part === 'Sleeve' ? design : state.sleeve, neckline: r.part === 'Neckline' ? design : state.neckline, request: { ...r, status: 'Approved' }, acknowledged: false, approvedAt: dateOnly(action.at), undo: { version: state.version, sleeve: state.sleeve, neckline: state.neckline, request: r, events: state.events, declined: state.declined }, declined: r.outcome === 'Impossible' ? [...state.declined, `${r.style}, cannot be made · ${dateOnly(action.at)}`] : state.declined, message: `${design} approved. It is now the agreed design (Version ${v}).`, events: [...state.events.map(e => e.status === 'Approved' ? { ...e, status: 'Superseded' as const } : e), { title: `Version ${v} · Customer approved`, text: `${r.part}: ${design} · ${r.cost} · ${r.date}`, status: 'Approved', at: action.at }] };
    }
    case 'undo': {
      if (!state.undo) return fail('There is no approval to undo.');
      if (state.stitching || state.finished) return fail('The worker has started stitching, so this approval can no longer be undone. Ask Master Mahad instead.');
      const u = state.undo;
      return { ...base, version: u.version, sleeve: u.sleeve, neckline: u.neckline, request: u.request, declined: u.declined, acknowledged: false, undo: undefined, message: `Approval undone. Version ${u.version} is current again. Choose an option.`, events: [...u.events, { title: 'Customer undid the approval', text: `Version ${u.version} is current again.`, status: 'Pending', at: action.at }] };
    }
    case 'reject': {
      const r = state.request;
      if (r?.status !== 'Pending') return fail('There is no open request to decline.');
      const declined = r.outcome === 'Impossible' ? r.alternative ?? r.style : r.style;
      return { ...base, request: { ...r, status: 'Rejected' }, declined: [...state.declined, `${declined}, declined · ${dateOnly(action.at)}`], message: 'Tailor notified: original design kept.', events: [...state.events, { title: 'Customer kept the original design', text: `Declined: ${declined}. Version ${state.version} stays current.`, status: 'Rejected', at: action.at }] };
    }
    case 'acknowledge': return { ...base, acknowledged: action.value };
    case 'start': {
      if (!state.acknowledged) return fail('Confirm you have read the current version before starting. Tick “I have read the current version”, then start again.');
      if (state.request?.status === 'Pending') return fail('A change is waiting for the customer’s decision. Wait before stitching.');
      if (state.paused) return fail('This job is on hold until Master Mahad replies to your report.');
      return { ...base, stitching: true, stage: 'Stitching', undo: undefined, message: `Stitching started using approved Version ${state.version}.` };
    }
    case 'finish': {
      if (!state.stitching) return fail('Start stitching before marking the job as finished.');
      return { ...base, finished: true, message: 'Marked as finished. Master Mahad has been told.', events: [...state.events, { title: 'Worker finished stitching', text: `Version ${state.version}`, status: 'Approved', at: action.at }] };
    }
    case 'resolve': return state.paused ? { ...base, paused: false, message: 'Problem marked as solved. Shayan can continue.', events: [...state.events, { title: 'Tailor solved the problem', text: 'Work can continue.', status: 'Approved', at: action.at }] } : state;
    case 'conflict': {
      if (!action.kind) return fail('Choose what kind of problem it is, then send the report.');
      if (!action.reason.trim()) return fail('Describe the problem so Master Mahad can fix it. Your choice is kept.');
      return { ...base, paused: true, acknowledged: false, message: 'Report sent to Master Mahad. Work on this part is on hold until he replies.', events: [...state.events, { title: 'Worker reported a problem', text: `${action.kind} · ${action.reason}`, status: 'Pending', at: action.at }] };
    }
  }
}
