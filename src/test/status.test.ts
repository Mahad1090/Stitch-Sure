import { describe, it, expect } from 'vitest';
import { initialWorkflow, workflowReducer as reduce } from '@/lib/workflow';
import { activeStep, describe as headline, turn } from '@/lib/status';
const at = 'Oct 26, 2026 · 16:04';
const pending = () => reduce(initialWorkflow, { type: 'request', part: 'Sleeve', style: 'Bell sleeves', note: '', reference: false, at });
const reviewed = () => reduce(pending(), { type: 'review', outcome: 'Impossible', reason: 'Fabric is already cut', alternative: 'Cuff Trim', cost: 'No extra cost', date: 'Delivery unchanged', at });

describe('Role-aware status headline', () => {
  it('tells the tailor a new request needs review, and the customer it is waiting', () => {
    expect(headline(pending(), 'tailor', false).title).toMatch(/needs your review/);
    expect(headline(pending(), 'customer', false).title).toMatch(/Waiting for Master Mahad/);
  });
  it('tells the worker to hold stitching while a change is pending', () => expect(headline(pending(), 'worker', false).title).toMatch(/hold stitching/));
  it('says whose turn it is', () => { expect(turn(pending())).toBe('Waiting for the tailor'); expect(turn(reviewed())).toBe('Waiting for you'); expect(turn(pending(), 'tailor')).toBe('Waiting for you'); expect(turn(reviewed(), 'tailor')).toBe('Waiting for the customer'); });
  it('shows the customer a decision to make after an infeasible review', () => expect(headline(reviewed(), 'customer', false).title).toMatch(/Choose an option/));
  it('names the approved version for every role after approval', () => {
    const s = reduce(reviewed(), { type: 'approve', at });
    expect(headline(s, 'customer', false).next).toContain('Version 2');
    expect(headline(s, 'tailor', false).title).toContain('Version 2');
    expect(headline(s, 'worker', false).title).toContain('Version 2');
  });
});

describe('Progress rail', () => {
  it('moves request, review, approval, stitching', () => {
    expect(activeStep(initialWorkflow)).toBe(-1);
    expect(activeStep(pending())).toBe(1);
    expect(activeStep(reviewed())).toBe(2);
    const approved = reduce(reviewed(), { type: 'approve', at });
    expect(activeStep(approved)).toBe(3);
    const started = reduce(reduce(approved, { type: 'acknowledge', value: true }), { type: 'start' });
    expect(activeStep(started)).toBe(3);
    expect(activeStep(reduce(started, { type: 'finish', at }))).toBe(4);
  });
});
