import { useEffect, useRef, useState } from 'react';

/**
 * After a screen change, moves focus to the new card's heading (D5A S-04).
 * Not on first render, not while an error is showing (the error takes focus itself),
 * and not when only the prototype "View as" role changed, so its arrow keys keep working.
 */
export function useScreenFocus(role: string, screen: string, hold: boolean) {
  const last = useRef({ role, screen });
  useEffect(() => {
    const prev = last.current;
    last.current = { role, screen };
    if (prev.screen === screen || prev.role !== role || hold) return;
    document.querySelector<HTMLElement>('main [data-focus-target]')?.focus();
  }, [role, screen, hold]);
}

/** True while the media query matches. False on the server and on the first render. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}
