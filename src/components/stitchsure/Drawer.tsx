import { useEffect, useRef } from 'react';
import { Check, ChevronRight, Scissors, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CUSTOMER_ORDERS, ORDER } from '@/lib/sample';
import { t, term } from '@/lib/i18n';
import type { StitchSureModel } from './useStitchSure';

/**
 * The orders list, behind the menu button at every width. While open, the rest of the page is inert,
 * Escape closes it, and focus returns to the control that opened it.
 */
export function Drawer({ m }: { m: StitchSureModel }) {
  const { state, role, setNavOpen } = m;
  const close = useRef<HTMLButtonElement>(null);
  const shut = useRef(() => setNavOpen(false));
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') shut.current(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Wait until the page behind is no longer inert.
      setTimeout(() => opener?.focus(), 0);
    };
  }, []);
  const list = role === 'customer' ? t('nav.customerCount', { count: CUSTOMER_ORDERS.length }) : t(`nav.${role}`);
  const part = state.request?.part;
  return (
    <>
      <div className="ss-scrim" onClick={shut.current} />
      <div className="ss-side" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="ss-side-head"><h2 id="drawer-title">{list}</h2><Button ref={close} variant="ghost" size="icon" aria-label={t('nav.close')} onClick={shut.current}><X aria-hidden /></Button></div>
        <ul className="ss-side-list">
          <li>
            <a href="#main" aria-current="page" className="ss-order" onClick={shut.current}>
              <span className="ss-order-thumb" aria-hidden><Scissors /></span>
              <span className="ss-order-text">
                <strong>{term(ORDER.garment)}</strong>
                <small><bdi dir="ltr">{ORDER.id}</bdi> · {role === 'tailor' ? (part ? t('nav.change', { part: term(part) }) : t('nav.noRequest')) : t('order.due', { date: ORDER.delivery })}</small>
                {role === 'customer' && <em className="ss-order-state">{state.request?.status === 'Pending' ? t('nav.changePending') : term('In production')}</em>}
              </span>
              <ChevronRight className="ss-flip" aria-hidden />
            </a>
          </li>
          {role === 'customer' && CUSTOMER_ORDERS.filter(o => !o.current).map(o => (
            <li key={o.id} className="ss-order-past">
              <Check aria-hidden />
              <span className="ss-order-text"><strong>{term(o.garment)}</strong><small><bdi dir="ltr">{o.id}</bdi> · {term(o.detail)}</small></span>
            </li>
          ))}
        </ul>
        {role === 'customer' && <p className="ss-hint">{t('nav.samples')}</p>}
        {role !== 'worker' && <p className="ss-side-note"><ShieldCheck aria-hidden /><span><strong>{t('nav.note.title')}</strong>{t('nav.note.text')}</span></p>}
      </div>
    </>
  );
}
