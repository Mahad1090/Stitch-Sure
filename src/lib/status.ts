import type { Role, Workflow } from '@/lib/workflow';

export type StepKey = 'request' | 'review' | 'approval' | 'stitching';
export const STEPS: { key: StepKey; label: string; who: string }[] = [
  { key: 'request', label: 'Request', who: 'Customer' },
  { key: 'review', label: 'Review', who: 'Tailor' },
  { key: 'approval', label: 'Approval', who: 'Customer' },
  { key: 'stitching', label: 'Stitching', who: 'Worker' },
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
export function turn(s: Workflow, role: Role = 'customer'): string {
  const r = s.request;
  if (r?.status !== 'Pending') return '';
  const tailorsTurn = !r.outcome;
  if (role === 'tailor') return tailorsTurn ? 'Waiting for you' : 'Waiting for the customer';
  return tailorsTurn ? 'Waiting for the tailor' : 'Waiting for you';
}

export type Headline = { title: string; next: string };

/** One headline per role: the same state, described from that person's point of view. */
export function describe(s: Workflow, role: Role, sending: boolean): Headline {
  const r = s.request;
  const v = s.version;
  if (sending) return { title: 'Sending your request', next: 'Please wait. Your note and reference are kept.' };

  if (role === 'tailor') {
    if (s.paused) return { title: 'The worker reported a problem', next: 'Work on SS-014 is on hold until you reply.' };
    if (!r) return { title: 'No open requests', next: 'Nothing needs your review right now.' };
    if (r.status === 'Approved') return { title: `Areeba approved Version ${v}`, next: 'Shayan now sees only this version.' };
    if (r.status === 'Rejected') return { title: 'Areeba kept her original design', next: `Version ${v} stays current. Nothing changes for Shayan.` };
    if (!r.outcome) return { title: r.answer ? 'Areeba replied to your question' : 'New change request: needs your review', next: 'Read who is asking and what they want, then send your review.' };
    if (r.outcome === 'Needs clarification') return { title: 'Question sent: waiting for Areeba', next: 'Production stays on the approved version until she answers.' };
    return { title: 'Review sent: waiting for Areeba', next: 'The request stays open until she approves or keeps her original.' };
  }

  if (role === 'worker') {
    if (s.finished) return { title: 'Finished', next: `Version ${v} is done. Master Mahad has been told.` };
    if (s.paused) return { title: 'On hold: problem reported', next: 'Do not stitch the affected part. Wait for Master Mahad to reply.' };
    if (s.stitching) return { title: 'Stitching in progress', next: `Work from Version ${v} only.` };
    if (r?.status === 'Pending') return { title: 'A change is waiting: hold stitching', next: 'Wait for the customer’s decision. The approved version has not changed.' };
    return { title: `Version ${v} is current`, next: 'Read the final instructions, confirm, then start stitching.' };
  }

  // Plain words first; the version number stays as a reference everyone (tailor, worker) can quote.
  const design = `${s.sleeve} · ${s.neckline}`;
  if (s.stitching && r?.status !== 'Pending') return { title: 'Your agreed design is being stitched', next: `${design} (Version ${v}).` };
  if (!r) return { title: 'Your agreed design', next: `${design} (Version ${v}). Your tailor must agree before anything changes.` };
  if (r.status === 'Approved') return { title: 'Your agreed design is updated', next: `${design}. This is Version ${v}; Version ${v - 1} was replaced.` };
  if (r.status === 'Rejected') return { title: 'Your agreed design is unchanged', next: `${design} (Version ${v}). Tailor notified: original design kept.` };
  if (!r.outcome) return { title: 'Waiting for Master Mahad', next: `Your agreed design (Version ${v}) stays the same. Nothing is stitched from your request until you both agree.` };
  if (r.outcome === 'Needs clarification') return { title: 'Master Mahad has a question', next: 'Answer it so he can finish the review.' };
  if (r.outcome === 'Impossible') return { title: 'Master Mahad can’t make that. Choose an option', next: 'He suggests another design that works on your cut fabric.' };
  return { title: 'Master Mahad can make it. Choose an option', next: 'Approve it, or keep your original design.' };
}
