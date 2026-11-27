import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ChevronRight, FileCheck2, Menu, RotateCcw, Scissors, ShieldCheck, X, Clock3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Activity } from '@/components/stitchsure/Activity';
import { CustomerView } from '@/components/stitchsure/CustomerView';
import { TailorView } from '@/components/stitchsure/TailorView';
import { WorkerView } from '@/components/stitchsure/WorkerView';
import { Avatar, Chip, Notice, Segmented, StepRail } from '@/components/stitchsure/ui';
import { useStitchSure } from '@/components/stitchsure/useStitchSure';
import { useMediaQuery, useScreenFocus } from '@/components/stitchsure/useScreen';
import { CUSTOMER_ORDERS, ORDER, PERSONAS } from '@/lib/sample';
import { activeStep, describe, turn } from '@/lib/status';
import type { Role } from '@/lib/workflow';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'StitchSure — Every change, agreed together' },
    { name: 'description', content: 'A sample tailoring workflow for design requests, feasibility reviews, customer approvals and current worker specifications.' },
    { property: 'og:title', content: 'StitchSure — Every change, agreed together' },
    { property: 'og:description', content: 'Follow a purple kurta from a sleeve-change request to an approved production version.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: StitchSure,
});

const ROLES: { value: Role; label: string }[] = [{ value: 'customer', label: 'Customer' }, { value: 'tailor', label: 'Tailor' }, { value: 'worker', label: 'Worker' }];
/** Each portal names its own list (critique and card sort: separate portals, no role tabs inside the app). */
const NAV: Record<Role, string> = { customer: 'My orders', tailor: 'Requests', worker: 'My jobs' };

function StitchSure() {
  const m = useStitchSure();
  const [large, setLarge] = useState(false);
  useEffect(() => { document.documentElement.setAttribute("data-large", String(large)); }, [large]);
  const { state, role, busy, sending, banner } = m;
  const persona = PERSONAS[role];
  const { title, next } = describe(state, role, sending);
  const { customer, worker } = m;
  const r = state.request;
  useScreenFocus(
    role,
    [customer.screen, customer.showApproved, customer.confirmCancel, worker.reportOpen, r?.status, r?.outcome, r?.seen, r?.answer, state.version, state.stitching, state.finished, state.paused].join('|'),
    Boolean(state.error) || customer.confirmCancel,
  );
  const phone = useMediaQuery('(max-width: 700px)');
  const rail = <StepRail key="rail" active={activeStep(state)} />;
  const tiles = (
    <ul key="tiles" className="ss-tiles" aria-label="Order facts">
      <li><Clock3 aria-hidden /><span>Production stage</span><strong>{state.stage}</strong></li>
      <li><FileCheck2 aria-hidden /><span>{role === 'customer' ? 'Agreed design' : 'Current version'}</span><strong>Version {state.version}</strong></li>
      <li><Check aria-hidden /><span>Delivery</span><strong>{ORDER.delivery}</strong><small className="ss-tile-note">1 day before the mehndi</small></li>
    </ul>
  );
  const task = (
    <div key="task" className="ss-task">
      {role === 'customer' && <CustomerView m={m} />}
      {role === 'tailor' && <TailorView m={m} />}
      {role === 'worker' && <WorkerView m={m} />}
    </div>
  );
  return (
    <div className="ss-app">
      <div className="ss-demo" role="region" aria-label="Prototype controls">
        <span className="ss-demo-tag">Prototype only</span>
        <Segmented className="ss-roles" legend="View as" value={role} options={ROLES} disabled={busy} onChange={m.chooseRole} />
        <span className="ss-demo-note">Stands in for three people on three phones. Login is simulated.</span>
        <Button variant="outline" size="sm" disabled={busy} onClick={m.reset}><RotateCcw />Reset sample</Button>
      </div>
      <header className="ss-bar">
        <Button variant="ghost" size="icon" className="ss-menu" aria-label={`Open ${NAV[role].toLowerCase()}`} onClick={() => m.setNavOpen(true)}><Menu /></Button>
        <div className="ss-brand"><span className="ss-brand-mark"><Scissors aria-hidden /></span>StitchSure</div>
        <span className="ss-portal">{NAV[role]}</span>
        <Button variant="outline" size="sm" className="ss-large" aria-pressed={large} onClick={() => setLarge(v => !v)}>Large text</Button>
        <div className="ss-who"><div><strong>{persona.name}</strong><small>{persona.title}</small></div><Avatar initials={persona.initials} /></div>
      </header>

      <div className="ss-shell">
        {m.navOpen && <div className="ss-scrim" onClick={() => m.setNavOpen(false)} />}
        <nav className={cn('ss-side', m.navOpen && 'is-open')} aria-label="Orders">
          <div className="ss-side-head"><h2>{role === 'customer' ? `My orders (${CUSTOMER_ORDERS.length})` : NAV[role]}</h2><Button variant="ghost" size="icon" className="ss-menu" aria-label="Close orders" onClick={() => m.setNavOpen(false)}><X /></Button></div>
          {role === 'customer' ? (
            <ul className="ss-side-list ss-side-many">
              {CUSTOMER_ORDERS.map(o => (
                <li key={o.id}>
                  {o.current ? (
                    <a href="#main" aria-current="page" className="ss-order" onClick={() => m.setNavOpen(false)}>
                      <span className="ss-order-thumb" aria-hidden><Scissors /></span>
                      <span className="ss-order-text"><strong>{o.garment}</strong><small>{o.id} · {o.detail}</small><em className="ss-order-state is-live">{state.request?.status === 'Pending' ? 'Change pending' : o.status}</em></span>
                      <ChevronRight aria-hidden />
                    </a>
                  ) : (
                    <div className="ss-order is-past">
                      <span className="ss-order-thumb" aria-hidden><Check /></span>
                      <span className="ss-order-text"><strong>{o.garment}</strong><small>{o.id} · {o.detail}</small><em className="ss-order-state">{o.status}</em></span>
                    </div>
                  )}
                </li>
              ))}
              <li className="ss-hint">Older orders are sample history only in this prototype.</li>
            </ul>
          ) : (
          <ul className="ss-side-list">
            <li><a href="#main" aria-current="page" className="ss-order" onClick={() => m.setNavOpen(false)}>
              <span className="ss-order-thumb" aria-hidden><Scissors /></span>
              <span className="ss-order-text"><strong>{ORDER.garment}</strong><small>{ORDER.id} · {role === 'tailor' ? (state.request ? `${state.request.part.toLowerCase()} change` : 'no open request') : `Due ${ORDER.delivery}`}</small></span>
              <ChevronRight aria-hidden />
            </a></li>
          </ul>
          )}
          {role !== 'worker' && <p className="ss-side-note"><ShieldCheck aria-hidden /><span><strong>One agreed version</strong>The worker only ever sees the latest approved one.</span></p>}
        </nav>

        <main id="main" className="ss-main">
          <section className="ss-hero" aria-label="Order status">
            <div className="ss-hero-top">
              <p className="ss-eyebrow">Order {ORDER.id} · {ORDER.garment}</p>
              {role !== 'worker' && turn(state, role) && <Chip status={turn(state, role)} />}
            </div>
            <h1 aria-live="polite">{title}</h1>
            <p className="ss-next">{next}</p>
            <div aria-live="polite" aria-atomic="true">{banner && <Notice tone="ok">{banner}</Notice>}</div>
          </section>

          {/* On phones the task comes straight after the status banner (D5A M-26). */}
          {phone ? [task, rail, tiles] : [rail, tiles, task]}
        </main>

        {role !== 'worker' && <Activity events={state.events} />}
      </div>
    </div>
  );
}
