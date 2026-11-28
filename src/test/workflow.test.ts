import { describe, it, expect } from 'vitest';
import { initialWorkflow, workflowReducer as reduce, type Workflow } from '@/lib/workflow';
const at = 'Oct 26, 2026 · 16:04';
const pending = () => reduce(initialWorkflow, { type: 'request', part: 'Sleeve', style: 'Bell sleeves', note: 'flared opening at the wrist', reference: true, at });
const reviewed = (): Workflow => reduce(pending(), { type: 'review', outcome: 'Impossible', reason: 'Fabric is already cut', alternative: 'Cuff Trim', cost: 'No extra cost', date: 'Delivery unchanged', at });
describe('StitchSure workflow rules', () => {
  it('requires a part', () => expect(reduce(initialWorkflow, { type: 'request', part: '', style: 'Bell sleeves', note: '', reference: false, at }).request).toBeUndefined());
  it('requires a style', () => expect(reduce(initialWorkflow, { type: 'request', part: 'Sleeve', style: '', note: '', reference: false, at }).error).not.toBe(''));
  it('sends as pending, not accepted', () => { expect(pending().request?.status).toBe('Pending'); expect(pending().sleeve).toBe('Straight sleeve'); });
  it('seeing does not approve', () => { const s = reduce(pending(), { type: 'seen' }); expect(s.request?.seen).toBe(true); expect(s.request?.status).toBe('Pending'); });
  it('impossible requires a reason', () => expect(reduce(pending(), { type: 'review', outcome: 'Impossible', reason: '', alternative: 'Cuff Trim', cost: 'No extra cost', date: 'Delivery unchanged', at }).request?.outcome).toBeUndefined());
  it('impossible may offer nothing: no cost is needed, it cannot be approved, and keeping records why', () => {
    const refused = reduce(pending(), { type: 'review', outcome: 'Impossible', reason: 'Cut', alternative: '  ', cost: '', date: '', at });
    expect(refused.error).toBe(''); expect(refused.request?.alternative).toBe('');
    expect(reduce(refused, { type: 'approve', at }).error).not.toBe('');
    expect(reduce(refused, { type: 'reject', at }).declined[0]).toMatch(/Bell sleeves, cannot be made/);
  });
  it('an offered alternative still needs cost and delivery', () => expect(reduce(pending(), { type: 'review', outcome: 'Impossible', reason: 'Cut', alternative: 'Cuff Trim', cost: '', date: '', at }).error).not.toBe(''));
  it('bell sleeves cannot be possible when fabric is cut', () => expect(reduce(pending(), { type: 'review', outcome: 'Possible', reason: '', alternative: '', cost: 'No extra cost', date: 'Delivery unchanged', at }).request?.outcome).toBeUndefined());
  it('review leaves production unchanged until customer approval', () => { expect(reviewed().request?.status).toBe('Pending'); expect(reviewed().version).toBe(1); expect(reviewed().sleeve).toBe('Straight sleeve'); });
  it('approval produces Version 2 Cuff Trim and supersedes Version 1', () => { const s = reduce(reviewed(), { type: 'approve', at }); expect(s.version).toBe(2); expect(s.sleeve).toBe('Cuff Trim'); expect(s.request?.status).toBe('Approved'); expect(s.events[0]?.status).toBe('Superseded'); expect(s.request?.cost).toBe('No extra cost'); expect(s.request?.date).toBe('Delivery unchanged'); });
  it('keeping original rejects the change', () => { const s = reduce(reviewed(), { type: 'reject', at }); expect(s.request?.status).toBe('Rejected'); expect(s.version).toBe(1); expect(s.sleeve).toBe('Straight sleeve'); });
  it('clarification cannot be approved', () => { const s = reduce(pending(), { type: 'review', outcome: 'Needs clarification', reason: 'Which wrist width?', alternative: '', cost: '', date: '', at }); expect(reduce(s, { type: 'approve', at }).version).toBe(1); });
  it('cannot start without reading confirmation', () => { const s = reduce(initialWorkflow, { type: 'start' }); expect(s.stitching).toBe(false); expect(s.error).toContain('Confirm'); });
  it('confirmation enables stitching of the current approved version', () => { const s = reduce(reviewed(), { type: 'approve', at }); const started = reduce(reduce(s, { type: 'acknowledge', value: true }), { type: 'start' }); expect(started.stitching).toBe(true); expect(started.sleeve).toBe('Cuff Trim'); });
  it('pending request blocks stitching even after confirming', () => expect(reduce(reduce(pending(), { type: 'acknowledge', value: true }), { type: 'start' }).stitching).toBe(false));
  it('conflict pauses production and prevents restarting', () => { const s = reduce(initialWorkflow, { type: 'conflict', kind: 'Instructions conflict', reason: 'Sleeve does not match current version', at }); expect(s.paused).toBe(true); expect(s.events.at(-1)?.title).toBe('Worker reported a problem'); expect(reduce(reduce(s, { type: 'acknowledge', value: true }), { type: 'start' }).stitching).toBe(false); });
});

describe('Request submission safety', () => {
  it('does not append a second request while the first is pending', () => {
    const first = pending();
    const duplicate = reduce(first, { type: 'request', part: 'Sleeve', style: 'Bell sleeves', note: 'flared opening at the wrist', reference: true, at });
    expect(duplicate.events).toHaveLength(2);
    expect(duplicate.request?.note).toBe('flared opening at the wrist');
    expect(duplicate.request?.reference).toBe(true);
  });
  it('invalid review preserves the submitted design, note, and reference', () => {
    const result = reduce(pending(), { type: 'review', outcome: 'Impossible', reason: '', alternative: '', cost: 'No extra cost', date: 'Delivery unchanged', at });
    expect(result.request?.style).toBe('Bell sleeves');
    expect(result.request?.note).toBe('flared opening at the wrist');
    expect(result.request?.reference).toBe(true);
    expect(result.request?.status).toBe('Pending');
  });
});

describe('V2 rules from the critique log', () => {
  it('a style can be described in the note, but only with a note', () => {
    expect(reduce(initialWorkflow, { type: 'request', part: 'Neckline', style: 'As described in my note', note: '', reference: false, at }).request).toBeUndefined();
    expect(reduce(initialWorkflow, { type: 'request', part: 'Neckline', style: 'As described in my note', note: 'slightly deeper V', reference: false, at }).request?.status).toBe('Pending');
  });
  it('the no-style error offers the note option and keeps the note', () => expect(reduce(initialWorkflow, { type: 'request', part: 'Sleeve', style: '', note: 'x', reference: false, at }).error).toMatch(/Other.*your own words/));
  it('the customer can cancel before the tailor reviews', () => { const s = reduce(pending(), { type: 'cancel', at }); expect(s.request).toBeUndefined(); expect(s.version).toBe(1); });
  it('cannot cancel once the tailor has answered', () => expect(reduce(reviewed(), { type: 'cancel', at }).request?.status).toBe('Pending'));
  it('answering a question sends it back to the tailor', () => {
    const q = reduce(pending(), { type: 'review', outcome: 'Needs clarification', reason: 'How long?', alternative: '', cost: '', date: '', at });
    const a = reduce(q, { type: 'answer', text: '22 inches', at });
    expect(a.request?.outcome).toBeUndefined(); expect(a.request?.answer).toBe('22 inches'); expect(a.request?.status).toBe('Pending');
  });
  it('approval can be undone until stitching starts, then not', () => {
    const ok = reduce(reviewed(), { type: 'approve', at });
    const undone = reduce(ok, { type: 'undo', at });
    expect(undone.version).toBe(1); expect(undone.sleeve).toBe('Straight sleeve'); expect(undone.request?.status).toBe('Pending'); expect(undone.declined).toHaveLength(0);
    const started = reduce(reduce(ok, { type: 'acknowledge', value: true }), { type: 'start' });
    expect(reduce(started, { type: 'undo', at }).version).toBe(2);
  });
  it('declined suggestions are recorded', () => {
    expect(reduce(reviewed(), { type: 'reject', at }).declined[0]).toMatch(/Cuff Trim, declined/);
    expect(reduce(reviewed(), { type: 'approve', at }).declined[0]).toMatch(/Bell sleeves, cannot be made/);
  });
  it('a report needs a kind and a description, and puts work on hold until solved', () => {
    expect(reduce(initialWorkflow, { type: 'conflict', kind: '', reason: 'x', at }).paused).toBe(false);
    const held = reduce(initialWorkflow, { type: 'conflict', kind: 'Fabric issue', reason: 'stain on panel', at });
    expect(held.paused).toBe(true);
    expect(reduce(held, { type: 'resolve', at }).paused).toBe(false);
  });
  it('the worker can only finish after starting', () => {
    expect(reduce(initialWorkflow, { type: 'finish', at }).finished).toBe(false);
    const started = reduce(reduce(initialWorkflow, { type: 'acknowledge', value: true }), { type: 'start' });
    expect(reduce(started, { type: 'finish', at }).finished).toBe(true);
  });
});
