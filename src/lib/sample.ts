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
  placed: 'Oct 20, 2026',
  delivery: 'Oct 30, 2026',
  event: 'Cousin’s mehndi',
  eventDate: 'Oct 31, 2026',
};

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

export const STYLE_OPTIONS = {
  Sleeve: ['Bell sleeves', 'Cuff Trim', 'Straight sleeve'],
  Neckline: ['Round neckline', 'V-shaped neckline', 'Boat neckline'],
} as const satisfies Record<Part, readonly string[]>;

export const PROBLEM_KINDS = ['Measurement unclear', 'Fabric issue', 'Instructions conflict', 'Other'] as const;
