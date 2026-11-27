import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Check, Clock3, FileCheck2, Menu, RotateCcw, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Activity } from '@/components/stitchsure/Activity';
import { CustomerView } from '@/components/stitchsure/CustomerView';
import { Drawer } from '@/components/stitchsure/Drawer';
import { TailorView } from '@/components/stitchsure/TailorView';
import { WorkerView } from '@/components/stitchsure/WorkerView';
import { Avatar, Chip, Notice, Segmented, StepRail } from '@/components/stitchsure/ui';
import { useStitchSure } from '@/components/stitchsure/useStitchSure';
import { useMediaQuery, useScreenFocus } from '@/components/stitchsure/useScreen';
import { ORDER, PERSONAS } from '@/lib/sample';
import { t, term } from '@/lib/i18n';
import { activeStep, describe, turn } from '@/lib/status';
import type { Role } from '@/lib/workflow';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'StitchSure — Every change, agreed together' },
    { name: 'description', content: 'A sample tailoring workflow for design requests, feasibility reviews, customer approvals and current worker specifications.' },
    { property: 'og:title', content: 'StitchSure — Every change, agreed together' },
    { property: 'og:description', content: 'Follow a purple kurta from a sleeve-change request to an approved production version.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: StitchSure,
});

const ROLES: Role[] = ['customer', 'tailor', 'worker'];

function StitchSure() {
  const m = useStitchSure();
  const [large, setLarge] = useState(false);
  useEffect(() => { document.documentElement.setAttribute('data-large', String(large)); }, [large]);
  const { state, role, busy, sending, banner, customer, form, worker, navOpen } = m;
  const persona = PERSONAS[role];
  const r = state.request;
  const { title, next } = describe(state, role, sending);
  useScreenFocus(
    role,
    [customer.screen, form.step, customer.showApproved, customer.confirmCancel, worker.reportOpen, r?.status, r?.outcome, r?.seen, r?.answer, state.version, state.stitching, state.finished, state.paused].join('|'),
    Boolean(state.error) || customer.confirmCancel,
  );
  const phone = useMediaQuery('(max-width: 700px)');

  // Progress, facts and history appear only when they help (calm home screen).
  const detail = role === 'customer' && (customer.screen === 'order' || (customer.screen === 'home' && customer.inProgress));
  const showRail = detail || (role === 'tailor' && Boolean(r));
  const calm = role === 'worker' || (role === 'customer' && !detail);
  const turnNow = turn(state, role);

  const rail = showRail && <StepRail key="rail" active={activeStep(state)} />;
  const tiles = detail && (
    <ul key="tiles" className="ss-tiles" aria-label={t('order.facts')}>
      <li><Clock3 aria-hidden /><span>{t('tile.stage')}</span><strong>{term(state.stage)}</strong></li>
      <li><FileCheck2 aria-hidden /><span>{t('tile.agreed')}</span><strong>{t('version.n', { version: state.version })}</strong></li>
      <li><Check aria-hidden /><span>{t('tile.delivery')}</span><strong><bdi dir="ltr">{ORDER.delivery}</bdi></strong><small>{t('tile.deliveryNote')}</small></li>
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
      <div className="ss-demo" role="region" aria-label={t('demo.region')} inert={navOpen}>
        <span className="ss-demo-tag">{t('demo.tag')}</span>
        <Segmented<Role> className="ss-roles" legend={t('demo.viewAs')} value={role} options={ROLES.map(value => ({ value, label: t(`role.${value}`) }))} disabled={busy} onChange={m.chooseRole} />
        <span className="ss-demo-note">{t('demo.note')}</span>
        <Button variant="outline" disabled={busy} onClick={m.reset}><RotateCcw aria-hidden />{t('demo.reset')}</Button>
      </div>
      <header className="ss-bar" inert={navOpen}>
        <Button variant="ghost" size="icon" aria-label={t('nav.open', { list: t(`nav.${role}`) })} aria-expanded={navOpen} onClick={() => m.setNavOpen(true)}><Menu aria-hidden /></Button>
        <div className="ss-brand"><span className="ss-brand-mark"><Scissors aria-hidden /></span><span className="ss-brand-name" lang="en">StitchSure</span></div>
        <p className="ss-current-order"><span className="ss-sr">{t('bar.current')}: </span><bdi dir="ltr">{ORDER.id}</bdi> · {term(ORDER.garment)}</p>
        <div className="ss-tools">
          <Button variant="outline" aria-pressed={large} onClick={() => setLarge(v => !v)}>{t('bar.largeText')}</Button>
        </div>
        <div className="ss-who"><div><strong>{persona.name}</strong><small>{term(persona.title)}</small></div><Avatar initials={persona.initials} /></div>
      </header>

      {navOpen && <Drawer m={m} />}

      <div className={detail ? 'ss-shell has-activity' : 'ss-shell'} inert={navOpen}>
        <main id="main" className="ss-main">
          <section className="ss-hero" aria-label={t('order.status')}>
            {!calm && turnNow && <div className="ss-hero-chip"><Chip status={turnNow} /></div>}
            <h1 aria-live="polite">{title}</h1>
            {!calm && <p className="ss-next">{next}</p>}
            <div aria-live="polite" aria-atomic="true">{/* The finished job card already says this. */}
              {banner && !(role === 'worker' && state.finished) && <Notice tone="ok">{banner}</Notice>}</div>
          </section>

          {/* On phones the task comes straight after the status banner (D5A M-26). */}
          {phone ? [task, rail, tiles] : [rail, tiles, task]}
        </main>

        {detail && <Activity events={state.events} />}
      </div>
    </div>
  );
}
