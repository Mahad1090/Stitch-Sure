import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { formatStamp } from '@/lib/dates';
import { DESCRIBED, createInitialWorkflow, workflowReducer, type Action, type Outcome, type Part, type Role } from '@/lib/workflow';

const stamp = () => formatStamp(new Date());
/** Longest note a customer can type (D5A M-25). */
export const NOTE_LIMIT = 250;

/** The tailor decides every value: nothing is pre-filled (D5A S-01, S-05, A-18). */
const BLANK_REVIEW = { outcome: '' as Outcome | '', reason: '', question: '', alternative: '', cost: '', date: '' };

/** `home` shows the task in progress if there is one; `choices` always shows the three choices. */
export type CustomerScreen = 'home' | 'choices' | 'form' | 'order' | 'message';
export type FormStep = 1 | 2 | 3;

/** All screen state and handlers. The workflow rules themselves live in `lib/workflow.ts`. */
export function useStitchSure() {
  const [state, dispatch] = useReducer(workflowReducer, undefined, () => createInitialWorkflow());

  const [role, setRole] = useState<Role>('customer');
  const [navOpen, setNavOpen] = useState(false);

  // Customer
  const [screen, setScreen] = useState<CustomerScreen>('home');
  const [step, setStep] = useState<FormStep>(1);
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
  const [reply, setReply] = useState('');

  // Opening the tailor view is seeing the request: no extra button (D5A M-17).
  const unseen = role === 'tailor' && state.request?.status === 'Pending' && !state.request.seen;
  useEffect(() => { if (unseen) dispatch({ type: 'seen' }); }, [unseen]);

  // A confirmation message belongs to the person who acted, so hide it once the view switches role.
  const [hiddenNote, setHiddenNote] = useState('');
  const noteText = state.error ? '' : state.message;
  const noteRef = useRef('');
  noteRef.current = noteText;
  const banner = noteText && noteText !== hiddenNote ? noteText : '';
  const lastRole = useRef<Role>('customer');
  const switchRole = useCallback((r: Role) => {
    setHiddenNote(noteRef.current); setRole(previous => { if (previous !== r) lastRole.current = previous; return r; }); setNavOpen(false);
    setScreen(s => (s === 'form' ? s : 'home'));
  }, []);

  /** Clears the last message and error without changing the workflow. */
  const clearNotes = () => dispatch({ type: 'acknowledge', value: state.acknowledged });
  const go = (to: CustomerScreen) => { clearNotes(); setScreen(to); };
  // A new request always opens empty (critique row 22).
  const openForm = () => { setPart(''); setStyle(''); setNote(''); setReference(false); setStep(1); go('form'); };

  const choosePart = (p: Part) => {
    if (p === part) return;
    setPart(p); setStyle(p === 'Other' ? DESCRIBED : '');
  };

  const sendRequest = () => {
    if (sendLock.current) return;
    const action: Action = { type: 'request', part, style, note, reference, at: stamp() };
    if (workflowReducer(state, action).error) { dispatch(action); return; }
    sendLock.current = true; setSending(true);
    sendTimer.current = setTimeout(() => {
      dispatch(action);
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
  const sendReport = () => {
    const action: Action = { type: 'conflict', kind: problemKind, reason: problem, at: stamp() };
    const next = workflowReducer(state, action);
    dispatch(action);
    if (!state.paused && next.paused) { setReportOpen(false); setProblem(''); setProblemKind(''); }
  };
  const finish = () => dispatch({ type: 'finish', at: stamp() });
  const resolveProblem = () => { dispatch({ type: 'resolve', reply, at: stamp() }); setReply(''); };

  const reset = () => {
    dispatch({ type: 'reset' });
    setRole('customer'); setScreen('home'); setStep(1); setShowApproved(false); setConfirmCancel(false); setAnswer('');
    setPart(''); setStyle(''); setNote(''); setReference(false);
    setReportOpen(false); setProblem(''); setProblemKind(''); setReply('');
    setDraft(BLANK_REVIEW);
  };

  /** True while a request needs someone's attention, so progress and history are worth showing. */
  const inProgress = state.request?.status === 'Pending' || (showApproved && state.request?.status === 'Approved');

  /**
   * Where the back button leads from this screen, or nothing on the starting screen.
   * It only moves between screens: it never changes the order.
   */
  const back = (): (() => void) | undefined => {
    if (role === 'worker' && reportOpen) return () => setReportOpen(false);
    if (role !== 'customer') return () => switchRole(lastRole.current === role ? 'customer' : lastRole.current);
    const pending = state.request?.status === 'Pending';
    if (screen === 'order' || screen === 'message' || screen === 'form') return () => go('home');
    if (screen === 'choices') return pending ? () => go('home') : undefined;
    if (pending) return () => go('choices');
    if (showApproved && state.request?.status === 'Approved') return () => { setShowApproved(false); go('home'); };
    return undefined;
  };

  return {
    back: back(), state, dispatch, role, chooseRole: switchRole, navOpen, setNavOpen, banner, busy: sending, sending,
    customer: { screen, go, openForm, inProgress, confirmCancel, setConfirmCancel, cancelRequest, answer, setAnswer, sendAnswer, showApproved, setShowApproved },
    form: { step, setStep, part, style, setStyle, note, setNote, reference, setReference, choosePart, sendRequest },
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
    decide: { approve, undoApproval, keepOriginal },
    worker: { reportOpen, setReportOpen, problemKind, setProblemKind, problem, setProblem, sendReport, finish, reply, setReply, resolveProblem },
    reset,
  };
}
export type StitchSureModel = ReturnType<typeof useStitchSure>;
