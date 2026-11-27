import { Check, Clock3, History, Layers, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';
import type { Event } from '@/lib/workflow';
import { Chip } from './ui';

export function Timeline({ events }: { events: Event[] }) {
  const { t, msg } = useLang();
  return (
    <>
      <p className="ss-hint">{t('timeline.hint')}</p>
      <ol className="ss-timeline">
        {events.map((e, i) => (
          <li key={`${i}-${e.title}`} className={cn(e.status === 'Superseded' && 'is-off')}>
            <span className={cn('ss-tl-dot', e.status === 'Approved' && 'is-ok')} aria-hidden>{e.status === 'Approved' ? <Check /> : e.status === 'Superseded' ? <Layers /> : <Clock3 />}</span>
            <div>
              <time><bdi dir="ltr">{e.at}</bdi></time>
              <h3 className={cn(e.status === 'Superseded' && 'line-through')}>{e.msg ? msg(e.msg.title) : e.title}</h3>
              <p>{e.msg ? msg(e.msg.text) : e.text}</p>
              <Chip status={e.status} />
              {e.status === 'Superseded' && <p>{t('timeline.notForProduction')}</p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="ss-foot"><ShieldCheck aria-hidden />{t('timeline.foot')}</p>
    </>
  );
}

export function Activity({ events }: { events: Event[] }) {
  const { t } = useLang();
  return (
    <aside className="ss-activity" aria-label={t('timeline.title')}>
      <div className="ss-activity-head"><History aria-hidden /><h2>{t('timeline.title')}</h2></div>
      <Timeline events={events} />
    </aside>
  );
}
