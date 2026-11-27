import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';
import { ORDER } from '@/lib/sample';
import type { Extras, Part } from '@/lib/workflow';

const NECK: Record<string, { open: string; placket: number }> = {
  'Round neckline': { open: 'M122 48Q130 92 170 95Q210 92 218 48Q170 68 122 48Z', placket: 95 },
  'V-shaped neckline': { open: 'M122 48L170 120L218 48Q170 68 122 48Z', placket: 120 },
  'Boat neckline': { open: 'M116 50Q170 86 224 50Q170 64 116 50Z', placket: 76 },
  'Square neckline': { open: 'M124 49L132 96L208 96L216 49Q170 68 124 49Z', placket: 96 },
  'Deep round neckline': { open: 'M122 48Q124 128 170 132Q216 128 218 48Q170 68 122 48Z', placket: 132 },
  'Band collar': { open: 'M128 49L132 32Q170 46 208 32L212 49Q170 68 128 49Z', placket: 60 },
};
/** How far down the arm each sleeve reaches (1 is the wrist). */
const REACH: Record<string, number> = { 'Half sleeve': 0.45, 'Puff sleeve': 0.42, 'Three-quarter sleeve': 0.72, Sleeveless: 0.04 };
const HEM: Record<string, number> = { 'Short length': 262, 'Long length': 348 };
const TROUSER: Record<string, string> = {
  'Straight trouser': 'M116 250H224L218 446H180L170 330L160 446H122Z',
  Shalwar: 'M116 250H224C262 320 244 396 208 428V446H182L170 352L158 446H132V428C96 396 78 320 116 250Z',
  'Cigarette trouser': 'M116 250H224L204 420H184L170 330L156 420H136Z',
  'Wide-leg trouser': 'M116 250H224L250 446H182L170 330L158 446H90Z',
  Churidar: 'M116 250H224L196 446H183L170 330L157 446H144Z',
};
/** Pointer shortcuts on the picture, one per part the drawing can show. */
const SPOTS = ['Neckline', 'Sleeve', 'Pocket', 'Length', 'Trouser'] as const;

/** A point `f` of the way along an edge of the arm. */
const along = (from: [number, number], to: [number, number], f: number) => `${(from[0] + (to[0] - from[0]) * f).toFixed(1)} ${(from[1] + (to[1] - from[1]) * f).toFixed(1)}`;

function shape(sleeve: string, hem: number) {
  const f = REACH[sleeve] ?? 1;
  const lo = along([88, 61], [26, 137], f), li = along([110, 116], [64, 166], f);
  const ro = along([252, 61], [314, 137], f), ri = along([230, 116], [276, 166], f);
  const body = `M122 48L88 61L${lo}L${li}L110 116L100 ${hem}Q170 ${hem + 15} 240 ${hem}L230 116L${ri}L${ro}L252 61L218 48Q170 70 122 48Z`;
  const cuff = (o: string, i: string, o2: string, i2: string) => `M${o}L${i}L${i2}L${o2}Z`;
  if (sleeve === 'Bell sleeves') return { body, l: 'M26 137L12 160L54 190L64 166Z', r: 'M276 166L286 190L328 160L314 137Z' };
  if (sleeve === 'Puff sleeve') return { body, l: 'M104 56Q52 52 54 102Q66 134 94 118L108 100Z', r: 'M236 56Q288 52 286 102Q274 134 246 118L232 100Z' };
  const g = Math.max(f - 0.12, 0);
  return {
    body,
    l: cuff(lo, li, along([88, 61], [26, 137], g), along([110, 116], [64, 166], g)),
    r: cuff(ro, ri, along([252, 61], [314, 137], g), along([230, 116], [276, 166], g)),
  };
}

type Props = {
  sleeve: string;
  neckline: string;
  /** Length, pocket and described extras. */
  extras?: Extras | undefined;
  /** Part highlighted as "selected". */
  part?: Part | '';
  /** When given, the two parts become tappable hotspots. */
  select?: ((p: Part) => void) | undefined;
  /** Compact version for side-by-side comparisons. */
  small?: boolean;
};

export function Garment({ sleeve, neckline, extras, part = '', select, small }: Props) {
  const { t, term } = useLang();
  const neck = NECK[neckline] ?? NECK['Round neckline']!;
  const hem = HEM[extras?.Length ?? ''] ?? 320;
  const sl = shape(sleeve, hem);
  const vars = { garment: term(ORDER.garment), sleeve: term(sleeve), neckline: term(neckline) };
  const desc = part ? t('garment.altSelected', { ...vars, part: term(part) }) : t('garment.alt', vars);
  const trouser = extras?.Trouser ?? 'Straight trouser';
  return (
    <div className={cn('ss-garment', small && 'ss-garment-sm')}>
      <div className={cn('ss-garment-frame', select && 'has-spots')}>
      <svg viewBox="0 0 340 456" role="img" aria-label={desc}>
        <path className={cn('g-trouser', part === 'Trouser' && 'g-selected')} d={TROUSER[trouser] ?? TROUSER['Straight trouser']} />
        {trouser === 'Churidar' && <path className="g-seam" d="M145 420h13M146 430h12M182 420h13M182 430h12" />}
        <path className="g-body" d={sl.body} />
        <path className="g-seam" d={`M110 116L119 66M230 116L221 66M170 ${neck.placket}V185M100 ${hem - 12}Q170 ${hem + 2} 240 ${hem - 12}`} />
        {extras?.Pocket === 'Front pocket' && <path className="g-pocket" d="M186 128h30v24q-15 12-30 0z" />}
        {extras?.Pocket === 'Side pocket' && <path className="g-pocket" d="M111 196q20 14 -3 42M229 196q-20 14 3 42" />}
        <path className={cn('g-neck', part === 'Neckline' && 'g-selected')} d={neck.open} />
        <path className={cn('g-sleeve', part === 'Sleeve' && 'g-selected')} d={sl.l} />
        <path className={cn('g-sleeve', part === 'Sleeve' && 'g-selected')} d={sl.r} />
        {part === 'Length' && <path className="g-mark" d={`M100 ${hem}Q170 ${hem + 15} 240 ${hem}`} />}
        {part === 'Pocket' && <path className="g-mark" d="M184 122h36v36h-36z" />}
        {sleeve === 'Cuff Trim' && <><path className="g-trim" d="M31 141L60 162" /><path className="g-trim" d="M309 141L280 162" /></>}
        <circle className="g-button" cx="170" cy={neck.placket + 22} r="2.5" /><circle className="g-button" cx="170" cy={neck.placket + 44} r="2.5" /><circle className="g-button" cx="170" cy={neck.placket + 66} r="2.5" />
      </svg>
      {/* Pointer shortcuts only: keyboard users choose the part in the form (D5A S-08). */}
      {select && SPOTS.map(p => (
        <button key={p} type="button" tabIndex={-1} className={cn('ss-hotspot', `ss-hotspot-${p.toLowerCase()}`, part === p && 'is-on')} aria-pressed={part === p} onClick={() => select(p)}><span aria-hidden className="ss-hotspot-dot" />{t(`garment.hotspot.${p}`)}</button>
      ))}
      </div>
    </div>
  );
}
