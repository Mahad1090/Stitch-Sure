import { DESCRIBED, type Outcome, type Part, type Role } from '@/lib/workflow';

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
  placed: 'Oct 20, 2026',
  delivery: 'Oct 30, 2026',
  event: 'Cousin’s mehndi',
  eventDate: 'Oct 31, 2026',
};

/** English first, the word customers and tailors actually say beside it. */
export const PART_LABEL: Record<Part, string> = { Sleeve: 'Sleeve (bazu)', Neckline: 'Neckline (gala)' };

/** Simulated in-app notice shown to the tailor before sending. Nothing is really sent. */
export function noticeText(o: { part: Part; style: string; outcome: Outcome; reason: string; alternative: string; cost: string; date: string }): string {
  const part = o.part === 'Sleeve' ? 'sleeve' : 'neckline';
  const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : '…');
  const bare = (s: string) => s.trim().replace(/[.!?]+$/, '');
  const cost = lc(o.cost); const date = lc(o.date);
  if (o.outcome === 'Needs clarification') return `Assalam o Alaikum Areeba, Master Mahad has a question about your ${part} change: ${o.reason || '…'} Please reply in StitchSure.`;
  if (o.outcome === 'Possible') return `Assalam o Alaikum Areeba, good news: ${o.style} can be made. ${cost}, ${date}. Please open StitchSure to approve.`;
  return `Assalam o Alaikum Areeba, Master Mahad reviewed your ${part} change. ${o.style} can’t be made${o.reason ? `: ${bare(lc(o.reason))}` : ''}. He suggests ${o.alternative || '…'} (${cost}, ${date}). Please open StitchSure to approve it or keep your original.`;
}

/** Everything Areeba has placed. Only SS-014 is live in this prototype; the rest are sample history. */
export const CUSTOMER_ORDERS = [
  { id: 'SS-014', garment: 'Purple kurta', detail: 'Due Oct 30, 2026', status: 'In production', current: true },
  { id: 'SS-009', garment: 'Maroon kameez', detail: 'Delivered Aug 18, 2026', status: 'Delivered', current: false },
  { id: 'SS-006', garment: 'Green kurta', detail: 'Delivered Jun 24, 2026', status: 'Delivered', current: false },
  { id: 'SS-003', garment: 'Cream shalwar', detail: 'Delivered Mar 9, 2026', status: 'Delivered', current: false },
];

export const CUSTOMER = {
  name: 'Areeba',
  initials: 'AR',
  since: 'Customer since 2024 · 3 earlier orders',
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
export const RELEVANT_MEASUREMENT: Record<Part, string> = { Sleeve: 'Sleeve length (bazu)', Neckline: 'Neck depth (gala)' };

export const STYLE_OPTIONS: Record<Part, { value: string; label: string; hint: string }[]> = {
  Sleeve: [
    { value: 'Bell sleeves', label: 'Bell sleeves', hint: 'Flared opening at the wrist' },
    { value: 'Cuff Trim', label: 'Cuff Trim', hint: 'Decorative trim on a straight cuff' },
    { value: 'Straight sleeve', label: 'Straight sleeve', hint: 'Plain, fitted cuff' },
  ],
  Neckline: [
    { value: 'Round neckline', label: 'Round neckline', hint: 'Classic round opening' },
    { value: 'V-shaped neckline', label: 'V-shaped neckline', hint: 'Pointed, deeper opening' },
    { value: 'Boat neckline', label: 'Boat neckline', hint: 'Wide and shallow opening' },
  ],
};

/** Plain words from the critique (rows 19, 25): no "feasible". */
export const outcomeLabel: Record<Outcome, string> = {
  Possible: 'Can be made',
  Impossible: 'Cannot be made',
  'Needs clarification': 'Need info',
};

/** Listed styles plus a free-text choice (critique rows 8, 12). */
export function styleOptions(part: Part, current: string) {
  return [
    ...STYLE_OPTIONS[part].map(o => (o.value === current ? { ...o, label: `${o.label} (current)` } : o)),
    { value: DESCRIBED, label: DESCRIBED, hint: 'Write what you want in the note below' },
  ];
}

export const NOTE_PLACEHOLDER: Record<Part | '', string> = {
  Sleeve: 'e.g. flared opening at the wrist',
  Neckline: 'e.g. a slightly deeper V',
  '': 'Tell your tailor what you have in mind',
};

export const PROBLEM_KINDS = ['Measurement unclear', 'Fabric issue', 'Instructions conflict', 'Other'] as const;

export const outcomeHelp: Record<Outcome, string> = {
  Possible: 'Areeba sees your cost and delivery effect, then decides.',
  Impossible: 'Say why, and offer one design you can make. Her original stays current until she decides.',
  'Needs clarification': 'Ask one clear question. Nothing changes in production until she answers.',
};
