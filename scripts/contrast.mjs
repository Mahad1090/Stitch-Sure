// Measures WCAG contrast for the theme tokens in src/styles.css.
// Run: node scripts/contrast.mjs   (exits 1 if any pair misses its target)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

/** The two token blocks: the first :root is light, the one inside the dark media query is dark. */
function tokens(block) {
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]),
  );
}
const roots = [...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => tokens(m[1]));
const themes = { light: roots[0], dark: { ...roots[0], ...roots[1] } };

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground token, background token, minimum, what it is]
const PAIRS = [
  ["foreground", "background", 4.5, "Body text on page"],
  ["foreground", "card", 4.5, "Body text on card"],
  ["foreground", "fill", 4.5, "Body text on quiet fill"],
  ["foreground", "wait-soft", 4.5, "Body text on highlighted row"],
  ["muted-foreground", "background", 4.5, "Muted text on page"],
  ["muted-foreground", "card", 4.5, "Muted text on card"],
  ["muted-foreground", "fill", 4.5, "Muted text on quiet fill"],
  ["primary-foreground", "primary", 4.5, "Button text"],
  ["link", "card", 4.5, "Link on card"],
  ["link", "background", 4.5, "Link on page"],
  ["success", "success-soft", 4.5, "Success chip and notice"],
  ["success", "card", 4.5, "Success text on card"],
  ["destructive", "danger-soft", 4.5, "Error chip and notice"],
  ["wait", "wait-soft", 4.5, "Waiting chip and notice"],
  ["input", "card", 3, "Field and control edge on card"],
  ["input", "fill", 3, "Control edge on quiet fill"],
  ["brand", "card", 3, "Brand accent (bar, edge, icon chip) on card"],
  ["brand", "background", 3, "Brand accent on page"],
  ["ring", "card", 3, "Focus ring on card"],
  ["ring", "background", 3, "Focus ring on page"],
  ["ring", "fill", 3, "Focus ring on quiet fill"],
];

let failed = 0;
console.log("| Theme | Use | Foreground | Background | Ratio | Target | Result |");
console.log("|---|---|---|---|---|---|---|");
for (const [theme, t] of Object.entries(themes)) {
  for (const [fg, bg, min, use] of PAIRS) {
    const value = ratio(t[fg], t[bg]);
    const ok = value >= min;
    if (!ok) failed++;
    console.log(
      `| ${theme} | ${use} | ${fg} ${t[fg]} | ${bg} ${t[bg]} | ${value.toFixed(2)}:1 | ${min}:1 | ${ok ? "pass" : "FAIL"} |`,
    );
  }
}
// White icon on the brand colour (logo tile, icon chips): non-text, 3:1.
const white = ratio("#ffffff", themes.light.brand);
if (white < 3) failed++;
console.log(`| both | White icon on brand tile | #ffffff | brand ${themes.light.brand} | ${white.toFixed(2)}:1 | 3:1 | ${white >= 3 ? "pass" : "FAIL"} |`);

if (failed) {
  console.error(`${failed} pair(s) below target`);
  process.exit(1);
}
