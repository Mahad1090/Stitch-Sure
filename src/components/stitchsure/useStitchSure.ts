import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { initialWorkflow, workflowReducer, type Action, type Outcome, type Part, type Role } from '@/lib/workflow';

const stamp = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

/** The tailor decides every value: nothing is pre-filled (D5A S-01, S-05, A-18). */
const BLANK_REVIEW = { outcome: '' as Outcome | '', reason: '', question: '', alternative: '', cost: '', date: '' };

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
  const [draft, setDraft] = useState(BLANK_REVIEW);
  const edit = (patch: Partial<typeof BLANK_REVIEW>) => setDraft(d => ({ ...d, ...patch }));
  // A different request, or a customer reply, always starts a blank form. "Seen" alone does not.
  const requestKey = JSON.stringify([state.request && { ...state.request, seen: false }, state.events.filter(e => e.title.endsWith('change requested')).length]);
  useEffect(() => { setDraft(BLANK_REVIEW); }, [requestKey]);

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
    const { outcome, reason, question, alternative, cost, date } = draft;
    if (!outcome) return;
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
    setDraft(BLANK_REVIEW);
  };

  const busy = sending;
  return {
    state, dispatch, role, chooseRole: switchRole, navOpen, setNavOpen, banner, busy, sending,
    customer: { screen, openForm, backToOrder, confirmCancel, setConfirmCancel, cancelRequest, answer, setAnswer, sendAnswer, showApproved, setShowApproved },
    form: { part, style, note, setNote, reference, choosePart, chooseStyle, toggleReference, sendRequest },
    review: {
      ...draft, sendReview,
      /** Changing the outcome clears every field, so no text from another outcome is sent. */
      setOutcome: (outcome: Outcome) => setDraft({ ...BLANK_REVIEW, outcome }),
      setReason: (reason: string) => edit({ reason }),
      setQuestion: (question: string) => edit({ question }),
      setAlternative: (alternative: string) => edit({ alternative }),
      setCost: (cost: string) => edit({ cost }),
      setDate: (date: string) => edit({ date }),
    },
    decide: { approve, undoApproval, keepOriginal, markSeen },
    worker: { reportOpen, setReportOpen, problemKind, setProblemKind, problem, setProblem, sendReport, showEarlier, setShowEarlier },
    reset,
  };
}
export type StitchSureModel = ReturnType<typeof useStitchSure>;
