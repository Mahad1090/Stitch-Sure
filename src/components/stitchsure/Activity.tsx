import { Check, Clock3, History, Layers, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/workflow';
import { Chip } from './ui';

export function Activity({ events }: { events: Event[] }) {
  return (
    <aside className="ss-activity" aria-label="Version timeline">
      <div className="ss-activity-head"><History aria-hidden /><h2>Version timeline</h2></div>
      <p className="ss-hint">Every change in one shared record. Newest at the bottom.</p>
      <ol className="ss-timeline">
        {events.map((e, i) => (
          <li key={`${i}-${e.title}`} className={cn(e.status === 'Superseded' && 'is-off')}>
            <span className={cn('ss-tl-dot', e.status === 'Approved' && 'is-ok')} aria-hidden>{e.status === 'Approved' ? <Check /> : e.status === 'Superseded' ? <Layers /> : <Clock3 />}</span>
            <div>
              <time>{e.at}</time>
              <h3 className={cn(e.status === 'Superseded' && 'line-through')}>{e.title}</h3>
              <p>{e.text}</p>
              <Chip status={e.status} />
              {e.status === 'Superseded' && <p>Not for production</p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="ss-foot"><ShieldCheck aria-hidden />Only customer-approved changes become a production version.</p>
    </aside>
  );
}
