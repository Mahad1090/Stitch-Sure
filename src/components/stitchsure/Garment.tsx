import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';
import { ORDER } from '@/lib/sample';
import type { Part } from '@/lib/workflow';

const NECK: Record<string, { open: string; placket: number }> = {
  'Round neckline': { open: 'M122 48Q130 92 170 95Q210 92 218 48Q170 68 122 48Z', placket: 95 },
  'V-shaped neckline': { open: 'M122 48L170 120L218 48Q170 68 122 48Z', placket: 120 },
  'Boat neckline': { open: 'M116 50Q170 86 224 50Q170 64 116 50Z', placket: 76 },
};
const SLEEVE: Record<string, { l: string; r: string }> = {
  'Bell sleeves': { l: 'M26 137L12 160L54 190L64 166Z', r: 'M276 166L286 190L328 160L314 137Z' },
  'Straight sleeve': { l: 'M26 137L64 166L72 156L34 127Z', r: 'M276 166L314 137L306 127L268 156Z' },
  'Cuff Trim': { l: 'M26 137L64 166L72 156L34 127Z', r: 'M276 166L314 137L306 127L268 156Z' },
};

type Props = {
  sleeve: string;
  neckline: string;
  /** Part highlighted as "selected". */
  part?: Part | '';
  /** When given, the two parts become tappable hotspots. */
  select?: ((p: Part) => void) | undefined;
  /** Compact version for side-by-side comparisons. */
  small?: boolean;
};

export function Garment({ sleeve, neckline, part = '', select, small }: Props) {
  const { t, term } = useLang();
  const neck = NECK[neckline] ?? NECK['Round neckline']!;
  const sl = SLEEVE[sleeve] ?? SLEEVE['Straight sleeve']!;
  const vars = { garment: term(ORDER.garment), sleeve: term(sleeve), neckline: term(neckline) };
  const desc = part ? t('garment.altSelected', { ...vars, part: term(part) }) : t('garment.alt', vars);
  return (
    <div className={cn('ss-garment', small && 'ss-garment-sm')}>
      <svg viewBox="0 0 340 365" role="img" aria-label={desc}>
        <path className="g-body" d="M122 48L88 61L26 137L64 166L110 116L100 320Q170 335 240 320L230 116L276 166L314 137L252 61L218 48Q170 70 122 48Z" />
        <path className="g-seam" d={`M110 116L119 66M230 116L221 66M170 ${neck.placket}V185M100 308Q170 322 240 308`} />
        <path className={cn('g-neck', part === 'Neckline' && 'g-selected')} d={neck.open} />
        <path className={cn('g-sleeve', part === 'Sleeve' && 'g-selected')} d={sl.l} />
        <path className={cn('g-sleeve', part === 'Sleeve' && 'g-selected')} d={sl.r} />
        {sleeve === 'Cuff Trim' && <><path className="g-trim" d="M31 141L60 162" /><path className="g-trim" d="M309 141L280 162" /></>}
        <circle className="g-button" cx="170" cy={neck.placket + 22} r="2.5" /><circle className="g-button" cx="170" cy={neck.placket + 44} r="2.5" /><circle className="g-button" cx="170" cy={neck.placket + 66} r="2.5" />
      </svg>
      {/* Pointer shortcuts only: keyboard users choose the part in the form (D5A S-08). */}
      {select && (
        <>
          <button type="button" tabIndex={-1} className={cn('ss-hotspot ss-hotspot-sleeve', part === 'Sleeve' && 'is-on')} aria-pressed={part === 'Sleeve'} onClick={() => select('Sleeve')}><span aria-hidden className="ss-hotspot-dot" />{t('garment.hotspot.Sleeve')}</button>
          <button type="button" tabIndex={-1} className={cn('ss-hotspot ss-hotspot-neck', part === 'Neckline' && 'is-on')} aria-pressed={part === 'Neckline'} onClick={() => select('Neckline')}><span aria-hidden className="ss-hotspot-dot" />{t('garment.hotspot.Neckline')}</button>
        </>
      )}
    </div>
  );
}
