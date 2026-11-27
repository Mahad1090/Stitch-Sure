// axe-core (WCAG 2.0, 2.1, 2.2 A and AA), 44px targets and no horizontal scroll on every key screen,
// in English and Urdu, light and dark, desktop (1280) and phone (390), plus Large text and 200% text.
// Also fails on clipped text.
// Run: node scripts/a11y.mjs
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { ensureServer, journey, openApp, VIEWPORTS } from "./flow.mjs";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
const MIN_TARGET = 44;

/** Horizontal overflow in px, and any visible control smaller than 44 by 44 CSS px. */
function measure(min) {
  const root = document.documentElement;
  const small = [];
  for (const el of document.querySelectorAll("button, a[href], input, textarea, [role=checkbox]")) {
    if (el.closest("[inert], [hidden]") || el.getAttribute("aria-hidden") === "true") continue;
    // A radio or checkbox is operated through its whole label.
    const target = el.matches("input[type=radio], [role=checkbox]") ? (el.closest("label") ?? el) : el;
    const box = target.getBoundingClientRect();
    if (box.width <= 1 || box.height <= 1) continue;
    if (box.width + 0.5 < min || box.height + 0.5 < min)
      small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.id || "").trim().slice(0, 30)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
  }
  // Text that spills outside the window, or is cut off by its own box.
  const clipped = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest(".ss-sr, .ss-skip, [hidden], svg")) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const box = el.getBoundingClientRect();
    if (box.width <= 1) continue;
    const s = getComputedStyle(el);
    if (s.position === "absolute" && s.clipPath !== "none") continue;
    const cut = /hidden|clip/.test(s.overflow) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    if (cut || box.right > root.clientWidth + 1 || box.left < -1)
      clipped.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 30)}"`);
  }
  return { overflow: root.scrollWidth - root.clientWidth, small, clipped };
}

const stop = await ensureServer();
const browser = await chromium.launch();
const failures = [];
let axeRuns = 0;
let layoutChecks = 0;

for (const lang of ["en", "ur"]) {
  for (const viewport of Object.keys(VIEWPORTS)) {
    for (const mode of ["light", "dark", "large", "text200"]) {
      const label = `${lang}/${viewport}/${mode}`;
      const theme = mode === "dark" ? "dark" : "light";
      const { context, page, problems } = await openApp(browser, { lang, viewport, theme });
      if (mode === "large" || mode === "text200") {
        await page.locator(".ss-tools > button").last().click(); // the Large text toggle
        await page.locator('html[data-large="true"]').waitFor();
      }
      // Text doubled on top of nothing else: Large text stays on, the root size is forced to 200%.
      if (mode === "text200") await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      let screens = 0;
      await journey(page, lang, async (name) => {
        screens++;
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        axeRuns++;
        for (const v of violations)
          failures.push(`${label} ${name}: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(" ")}: ${v.nodes[0]?.failureSummary?.split("\n")[1] ?? ""}`);
        const { overflow, small, clipped } = await page.evaluate(measure, MIN_TARGET);
        layoutChecks++;
        if (overflow > 0) failures.push(`${label} ${name}: horizontal scroll of ${overflow}px`);
        for (const c of clipped) failures.push(`${label} ${name}: clipped text: ${c}`);
        for (const s of small) failures.push(`${label} ${name}: target under ${MIN_TARGET}px: ${s}`);
      });
      for (const p of problems) failures.push(`${label}: ${p}`);
      console.log(`checked ${label}: ${screens} screens`);
      await context.close();
    }
  }
}

await browser.close();
stop();
const unique = [...new Set(failures)];
console.log(`\n${axeRuns} axe runs and ${layoutChecks} layout checks. ${unique.length} problem(s).`);
for (const f of unique) console.log(`- ${f}`);
process.exit(unique.length ? 1 : 0);
