import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { initialWorkflow, workflowReducer, type Action, type Outcome, type Part, type Role } from '@/lib/workflow';

const stamp = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

const REVIEW_DEFAULTS = {
  outcome: 'Impossible' as Outcome,
  reason: 'Fabric is already cut, so there is not enough width for a flared wrist.',
  alternative: 'Cuff Trim',
  cost: 'No extra cost',
  date: 'Delivery unchanged',
};

export type CustomerScreen = 'home' | 'form';

/** All screen state and handlers. The workflow rules themselves live in `lib/workflow.ts`. */
export function useStitchSure() {
  const [state, rawDispatch] = useReducer(workflowReducer, initialWorkflow);
  const [feedback, setFeedback] = useState('');
  const dispatch = useCallback((action: Action) => { setFeedback(''); rawDispatch(action); }, []);

  const [role, setRole] = useState<Role>('customer');
  const [navOpen, setNavOpen] = useState(false);

  // Customer
  const [screen, setScreen] = useState<CustomerScreen>('home');
  const [part, setPart] = useState<Part | ''>('');
  const [style, setStyle] = useState('');
  const [note, setNote] = useState('');
  const [reference, setReference] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showApproved, setShowApproved] = useState(false);
  const sendLock = useRef(false);
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (sendTimer.current) clearTimeout(sendTimer.current); }, []);

  // Tailor review form
  const [outcome, setOutcome] = useState<Outcome>(REVIEW_DEFAULTS.outcome);
  const [reason, setReason] = useState(REVIEW_DEFAULTS.reason);
  const [question, setQuestion] = useState('How long should the sleeves be, in inches?');
  const [alternative, setAlternative] = useState(REVIEW_DEFAULTS.alternative);
  const [cost, setCost] = useState(REVIEW_DEFAULTS.cost);
  const [date, setDate] = useState(REVIEW_DEFAULTS.date);

  // Worker
  const [reportOpen, setReportOpen] = useState(false);
  const [problemKind, setProblemKind] = useState('');
  const [problem, setProblem] = useState('');
  const [showEarlier, setShowEarlier] = useState(false);

  // A confirmation message belongs to the person who acted, so hide it once the view switches role.
  const [hiddenNote, setHiddenNote] = useState('');
  const noteText = state.error ? '' : feedback || state.message;
  const noteRef = useRef('');
  noteRef.current = noteText;
  const banner = noteText && noteText !== hiddenNote ? noteText : '';
  const switchRole = useCallback((r: Role) => { setHiddenNote(noteRef.current); setRole(r); setNavOpen(false); }, []);

  // A new request always opens empty (critique row 22).
  const openForm = () => { setPart(''); setStyle(''); setNote(''); setReference(false); setScreen('form'); dispatch({ type: 'acknowledge', value: state.acknowledged }); };
  const backToOrder = () => { setScreen('home'); setFeedback(''); rawDispatch({ type: 'acknowledge', value: state.acknowledged }); };

  const choosePart = (p: Part) => {
    if (p === part) return;
    setPart(p); setStyle('');
    setFeedback(`${p} selected. Choose a style next.`);
  };
  const chooseStyle = (v: string) => { setStyle(v); setFeedback(''); };
  const toggleReference = () => {
    setFeedback(reference ? 'Reference removed.' : 'Reference attached (sample photo).');
    setReference(v => !v);
  };

  const sendRequest = () => {
    if (sendLock.current) return;
    const at = stamp();
    const probe = workflowReducer(state, { type: 'request', part, style, note, reference, at });
    if (probe.error) { dispatch({ type: 'request', part, style, note, reference, at }); return; }
    sendLock.current = true; setSending(true);
    setFeedback('Sending your request. Your note and reference are kept.');
    sendTimer.current = setTimeout(() => {
      dispatch({ type: 'request', part, style, note, reference, at });
      setSending(false); sendLock.current = false; setScreen('home');
    }, 700);
  };
  const cancelRequest = () => { dispatch({ type: 'cancel', at: stamp() }); setConfirmCancel(false); };

  const sendReview = () => {
    const ask = outcome === 'Needs clarification';
    dispatch({ type: 'review', outcome, reason: ask ? question : reason, alternative: outcome === 'Impossible' ? alternative : '', cost, date, at: stamp() });
  };
  const sendAnswer = () => { dispatch({ type: 'answer', text: answer, at: stamp() }); setAnswer(''); };
  const approve = () => { dispatch({ type: 'approve', at: stamp() }); setShowApproved(true); };
  const undoApproval = () => { dispatch({ type: 'undo', at: stamp() }); setShowApproved(false); };
  const keepOriginal = () => dispatch({ type: 'reject', at: stamp() });
  const markSeen = () => dispatch({ type: 'seen' });
  const sendReport = () => {
    const before = state.paused;
    const next = workflowReducer(state, { type: 'conflict', kind: problemKind, reason: problem, at: stamp() });
    dispatch({ type: 'conflict', kind: problemKind, reason: problem, at: stamp() });
    if (!before && next.paused) { setReportOpen(false); setProblem(''); setProblemKind(''); }
  };

  const reset = () => {
    dispatch({ type: 'reset' });
    setRole('customer'); setScreen('home'); setShowApproved(false); setConfirmCancel(false); setAnswer('');
    setPart(''); setStyle(''); setNote(''); setReference(false);
    setReportOpen(false); setProblem(''); setProblemKind(''); setShowEarlier(false);
    setOutcome(REVIEW_DEFAULTS.outcome); setReason(REVIEW_DEFAULTS.reason); setAlternative(REVIEW_DEFAULTS.alternative); setCost(REVIEW_DEFAULTS.cost); setDate(REVIEW_DEFAULTS.date);
  };

  const busy = sending;
  return {
    state, dispatch, role, chooseRole: switchRole, navOpen, setNavOpen, banner, busy, sending,
    customer: { screen, openForm, backToOrder, confirmCancel, setConfirmCancel, cancelRequest, answer, setAnswer, sendAnswer, showApproved, setShowApproved },
    form: { part, style, note, setNote, reference, choosePart, chooseStyle, toggleReference, sendRequest },
    review: { outcome, setOutcome, reason, setReason, question, setQuestion, alternative, setAlternative, cost, setCost, date, setDate, sendReview },
    decide: { approve, undoApproval, keepOriginal, markSeen },
    worker: { reportOpen, setReportOpen, problemKind, setProblemKind, problem, setProblem, sendReport, showEarlier, setShowEarlier },
    reset,
  };
}
export type StitchSureModel = ReturnType<typeof useStitchSure>;
