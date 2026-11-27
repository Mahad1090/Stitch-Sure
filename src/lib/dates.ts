/** Sample dates are placed around today, so delivery, the event and the timeline never contradict (D5A A-24). */
const DAY: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

export const formatDate = (d: Date) => d.toLocaleDateString('en-US', DAY);
export const formatStamp = (d: Date) => d.toLocaleString('en-US', { ...DAY, hour: '2-digit', minute: '2-digit', hour12: false });

export const daysFrom = (now: Date, days: number, hour = 12) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hour);

/** Order placed, then first agreed, then today, then delivery, then the event. */
export function sampleDates(now: Date = new Date()) {
  return {
    placed: daysFrom(now, -6),
    agreed: daysFrom(now, -5, 10),
    delivery: daysFrom(now, 3),
    event: daysFrom(now, 4),
  };
}
