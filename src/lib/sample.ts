import { t, term, type Lang, type Var } from '@/lib/i18n';
import { formatDate, sampleDates } from '@/lib/dates';
import type { Outcome, Part, Role } from '@/lib/workflow';

/** All people, contact details and measurements below are invented sample data. */
export const PERSONAS: Record<Role, { name: string; title: string; initials: string }> = {
  customer: { name: 'Areeba', title: 'Customer', initials: 'AR' },
  tailor: { name: 'Master Mahad', title: 'Tailor', initials: 'MM' },
  worker: { name: 'Shayan', title: 'Stitching worker', initials: 'SH' },
};

export const ORDER = {
  id: 'SS-014',
  garment: 'Purple kurta',
  fabric: 'Cotton · Purple · 3 gaz',
  event: 'Cousin’s mehndi',
  get placed() { return formatDate(sampleDates().placed); },
  get delivery() { return formatDate(sampleDates().delivery); },
  get eventDate() { return formatDate(sampleDates().event); },
};

/** Simulated in-app notice shown to the tailor before sending. Nothing is really sent. */
export function noticeText(o: { part: Part; style: string; outcome: Outcome; reason: string; alternative: string; cost: string; date: string }, lang: Lang = 'en'): string {
  // Mid-sentence English reads in lower case; Urdu has no letter case.
  const lc = (v: string) => (v ? (lang === 'en' ? v.charAt(0).toLowerCase() + v.slice(1) : v) : '…');
  const part = lc(term(o.part, lang));
  if (o.outcome === 'Needs clarification') return t('notice.question', { part, reason: o.reason || '…' }, lang);
  const shared = { part, style: { term: o.style }, cost: lc(o.cost), date: lc(o.date) };
  if (o.outcome === 'Possible') return t('notice.possible', shared, lang);
  const reason = o.reason.trim().replace(/[.!?۔]+$/, '');
  const why: Var = reason ? { msg: { key: 'notice.why', vars: { reason: lc(reason) } } } : '';
  if (!o.alternative.trim()) return t('notice.refused', { ...shared, why }, lang);
  return t('notice.impossible', { ...shared, why, alternative: { term: o.alternative } }, lang);
}

/** Everything Areeba has placed. Only SS-014 is live in this prototype; the rest are sample history. */
export const CUSTOMER_ORDERS = [
  { id: 'SS-014', garment: 'Purple kurta', current: true, deliveredDaysAgo: 0 },
  { id: 'SS-009', garment: 'Maroon kameez', current: false, deliveredDaysAgo: 101 },
  { id: 'SS-006', garment: 'Green kurta', current: false, deliveredDaysAgo: 156 },
  { id: 'SS-003', garment: 'Cream shalwar', current: false, deliveredDaysAgo: 263 },
];

export const CUSTOMER = {
  name: 'Areeba',
  initials: 'AR',
  get sinceYear() { return new Date().getFullYear() - 2; },
  contact: 'Phone · 03•• ••• 0000',
  measurements: [
    { label: 'Chest', value: '36″' },
    { label: 'Shoulder', value: '15″' },
    { label: 'Sleeve length (bazu)', value: '22″' },
    { label: 'Neck depth (gala)', value: '6″' },
    { label: 'Kurta length (lambai)', value: '40″' },
  ],
};

/** Which measurement on file matters for each garment part. */
export const RELEVANT_MEASUREMENT: Partial<Record<Part, string>> = { Sleeve: 'Sleeve length (bazu)', Neckline: 'Neck depth (gala)', Length: 'Kurta length (lambai)' };

/** Listed styles per part. "Other" has none: the customer describes it. */
export const STYLE_OPTIONS = {
  Sleeve: ['Bell sleeves', 'Cuff Trim', 'Straight sleeve', 'Half sleeve', 'Three-quarter sleeve', 'Puff sleeve', 'Sleeveless'],
  Neckline: ['Round neckline', 'V-shaped neckline', 'Boat neckline', 'Square neckline', 'Deep round neckline', 'Band collar'],
  Length: ['Standard length', 'Short length', 'Long length'],
  Pocket: ['No pocket', 'Side pocket', 'Front pocket'],
  Trouser: ['Straight trouser', 'Shalwar', 'Cigarette trouser', 'Wide-leg trouser', 'Churidar'],
  Other: [],
} as const satisfies Record<Part, readonly string[]>;
export const PARTS = Object.keys(STYLE_OPTIONS) as Part[];

export const PROBLEM_KINDS = ['Measurement unclear', 'Fabric issue', 'Instructions conflict', 'Other'] as const;
