import { t, type Key, type Lang, type Var } from '@/lib/i18n';
import type { Role, Workflow } from '@/lib/workflow';

export type StepKey = 'request' | 'review' | 'approval' | 'stitching';
export const STEPS: { key: StepKey; who: Role }[] = [
  { key: 'request', who: 'customer' },
  { key: 'review', who: 'tailor' },
  { key: 'approval', who: 'customer' },
  { key: 'stitching', who: 'worker' },
];

/** 0-3 = the active step; 4 = everything done. -1 = no change requested (nothing to track). */
export function activeStep(s: Workflow): number {
  const r = s.request;
  if (s.finished) return 4;
  if (s.stitching) return 3;
  if (!r || r.status === 'Rejected') return -1;
  if (r.status === 'Pending') return !r.outcome || r.outcome === 'Needs clarification' ? 1 : 2;
  return 3;
}

/** Whose turn it is, in words (critique rows 2, 11, 24). */
export function turn(s: Workflow, role: Role = 'customer'): '' | 'Waiting for you' | 'Waiting for the tailor' | 'Waiting for the customer' {
  const r = s.request;
  if (r?.status !== 'Pending') return '';
  const tailorsTurn = !r.outcome;
  if (role === 'tailor') return tailorsTurn ? 'Waiting for you' : 'Waiting for the customer';
  return tailorsTurn ? 'Waiting for the tailor' : 'Waiting for you';
}

export type Headline = { title: string; next: string };

/** One headline per role: the same state, described from that person's point of view. */
export function describe(s: Workflow, role: Role, sending: boolean, lang: Lang = 'en'): Headline {
  const r = s.request;
  const version = s.version;
  const say = (key: Extract<Key, `head.${string}`>, next: Key, vars: Record<string, Var> = { version }): Headline => ({ title: t(key, vars, lang), next: t(next, vars, lang) });
  if (sending) return say('head.sending', 'head.sending.next');

  if (role === 'tailor') {
    if (s.paused) return say('head.t.paused', 'head.t.paused.next');
    if (!r) return say('head.t.none', 'head.t.none.next');
    if (r.status === 'Approved') return say('head.t.approved', 'head.t.approved.next');
    if (r.status === 'Rejected') return say('head.t.rejected', 'head.t.rejected.next');
    if (!r.outcome) return say(r.answer ? 'head.t.replied' : 'head.t.new', 'head.t.new.next');
    if (r.outcome === 'Needs clarification') return say('head.t.asked', 'head.t.asked.next');
    return say('head.t.reviewed', r.outcome === 'Impossible' && !r.alternative ? 'head.t.refused.next' : 'head.t.reviewed.next');
  }

  if (role === 'worker') {
    if (s.finished) return say('head.w.finished', 'head.w.finished.next');
    if (s.paused) return say('head.w.paused', 'head.w.paused.next');
    if (s.stitching) return say('head.w.stitching', 'head.w.stitching.next');
    if (r?.status === 'Pending') return say('head.w.pending', 'head.w.pending.next');
    return say('head.w.current', 'head.w.current.next');
  }

  // Plain words first; the version number stays as a reference everyone (tailor, worker) can quote.
  const design: Var = { msg: { key: 'event.pair', vars: { first: { term: s.sleeve }, second: { term: s.neckline } } } };
  const vars = { design, version, old: version - 1 };
  if (s.stitching && r?.status !== 'Pending') return say('head.c.stitching', 'head.c.stitching.next', vars);
  if (!r) return say('head.c.agreed', 'head.c.agreed.next', vars);
  if (r.status === 'Approved') return say('head.c.updated', 'head.c.updated.next', vars);
  if (r.status === 'Rejected') return say('head.c.unchanged', 'head.c.unchanged.next', vars);
  if (!r.outcome) return say('head.c.waiting', 'head.c.waiting.next', vars);
  if (r.outcome === 'Needs clarification') return say('head.c.question', 'head.c.question.next', vars);
  if (r.outcome === 'Impossible' && !r.alternative) return say('head.c.refused', 'head.c.refused.next', vars);
  if (r.outcome === 'Impossible') return say('head.c.impossible', 'head.c.impossible.next', vars);
  return say('head.c.possible', 'head.c.possible.next', vars);
}
