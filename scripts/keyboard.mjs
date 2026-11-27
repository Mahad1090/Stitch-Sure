// Completes request, review, approve, start and finish using only the keyboard.
// At each screen it Tabs through the whole page and checks that every control is reachable,
// shows a visible focus ring and does not trap focus, and that focus lands on the new heading.
// Run: node scripts/keyboard.mjs
import { chromium } from "playwright";
import { t, term } from "../src/lib/i18n.ts";
import { ensureServer, openApp } from "./flow.mjs";

const stop = await ensureServer();
const browser = await chromium.launch();
const failures = [];

/** What has focus now, and whether a ring is drawn on it (or on the label standing in for it). */
function focused() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const ringed = [el, el.closest("label")].some((n) => {
    if (!n) return false;
    const s = getComputedStyle(n);
    return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2;
  });
  const box = (el.matches(".ss-sr") ? el.closest("label") : el).getBoundingClientRect();
  return {
    id: el.dataset["kb"] ?? "",
    what: `${el.tagName.toLowerCase()} "${(el.textContent || el.closest("label")?.textContent || el.id).trim().slice(0, 40)}"`,
    ringed,
    onScreen: box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth,
  };
}

/** Tags every control a keyboard user must be able to reach. A radio group counts once. */
function tagControls() {
  const need = new Set();
  let n = 0;
  for (const el of document.querySelectorAll("button, a[href], input, textarea, [tabindex]")) {
    if (el.closest("[inert], [hidden]") || el.disabled || el.closest("fieldset:disabled")) continue;
    if (el.getAttribute("tabindex") === "-1" || el.getAttribute("aria-hidden") === "true") continue;
    if (!el.getClientRects().length) continue;
    const key = el.type === "radio" ? `radio:${el.name}` : `c${n++}`;
    el.dataset["kb"] = key;
    need.add(key);
  }
  return [...need];
}

for (const [lang, viewport] of [["en", "desktop"], ["en", "phone"], ["ur", "desktop"], ["ur", "phone"]]) {
  const label = `${lang}/${viewport}`;
  const { context, page, problems } = await openApp(browser, { lang, viewport });
  const say = (key, vars) => t(key, vars, lang);
  const fail = (m) => failures.push(`${label}: ${m}`);
  let audited = 0;
  let presses = 0;

  const key = async (name) => {
    presses++;
    await page.keyboard.press(name);
  };

  /** One full Tab cycle from the current position. */
  async function audit(screen) {
    audited++;
    const need = new Set(await page.evaluate(tagControls));
    const seen = new Set();
    // Start from the top of the document so the cycle is complete.
    await page.evaluate(() => {
      const start = document.createElement("span");
      start.tabIndex = -1;
      document.body.prepend(start);
      start.focus();
      start.remove();
    });
    for (let i = 0; i < need.size * 3 + 10; i++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(focused);
      if (!f) break; // focus left the page: end of the cycle, so no trap
      if (seen.has(f.id) && f.id) break;
      if (!f.ringed) fail(`${screen}: no visible focus on ${f.what}`);
      if (!f.onScreen) fail(`${screen}: focused control is off screen: ${f.what}`);
      if (f.id) seen.add(f.id);
    }
    const missed = [...need].filter((k) => !seen.has(k));
    for (const k of missed) {
      const what = await page.evaluate((k) => document.querySelector(`[data-kb="${k}"]`)?.outerHTML.slice(0, 120), k);
      fail(`${screen}: not reachable by Tab: ${what}`);
    }
  }

  /** Presses Tab (or Shift+Tab) until the element matching `selector` has focus. */
  async function tabTo(selector, { back = false } = {}) {
    for (let i = 0; i < 60; i++) {
      if (await page.evaluate((s) => Boolean(document.activeElement?.matches(s)), selector)) return;
      await key(back ? "Shift+Tab" : "Tab");
    }
    throw new Error(`${label}: could not Tab to ${selector}`);
  }

  /** Focus a button by its accessible name using Tab only. */
  async function tabToButton(name) {
    await page.getByRole("button", { name, exact: true }).evaluate((el) => (el.dataset["target"] = "1"));
    await tabTo("[data-target]");
    await page.evaluate(() => document.activeElement?.removeAttribute("data-target"));
  }

  /** Focus a radio group with Tab, then move inside it with the arrow keys. */
  async function radio(value) {
    const name = await page.locator(`input[value="${value}"]`).first().getAttribute("name");
    const group = `input[name="${name}"]`;
    const inGroup = () => page.evaluate((s) => Boolean(document.activeElement?.matches(s)), group);
    // The role switch sits at the top of the page, so go backwards to it.
    const back = await page.locator(group).first().evaluate((el) =>
      Boolean(document.activeElement && el.compareDocumentPosition(document.activeElement) & Node.DOCUMENT_POSITION_FOLLOWING));
    for (let i = 0; i < 60 && !(await inGroup()); i++) await key(back ? "Shift+Tab" : "Tab");
    if (!(await inGroup())) throw new Error(`${label}: could not Tab to the group with ${value}`);
    for (let i = 0; i < 6; i++) {
      if (await page.evaluate((v) => document.activeElement?.value === v, value)) {
        if (!(await page.locator(`input[value="${value}"]`).first().isChecked())) await key("Space");
        return;
      }
      await key("ArrowDown");
    }
    throw new Error(`${label}: arrows did not reach ${value}`);
  }

  async function typeInto(id, text) {
    await tabTo(`#${id}`);
    await page.keyboard.type(text);
  }

  /** After a screen change, focus must be on the new heading. */
  async function onHeading(expected, step) {
    await page.waitForFunction(
      (text) => {
        const el = document.activeElement;
        return el?.hasAttribute("data-focus-target") && (!text || el.textContent === text);
      },
      expected,
      { timeout: 4000 },
    ).catch(async () => {
      const got = await page.evaluate(() => `${document.activeElement?.tagName} "${document.activeElement?.textContent?.slice(0, 60)}"`);
      fail(`${step}: expected focus on heading "${expected}", got ${got}`);
    });
  }

  const press = async (name) => {
    await tabToButton(name);
    await key("Enter");
  };

  try {
    // The skip link is the very first stop and lands on the task area.
    await key("Tab");
    if ((await page.evaluate(() => document.activeElement?.textContent)) !== say("skip")) fail("first Tab stop is not the skip link");
    await key("Enter");
    if ((await page.evaluate(() => document.activeElement?.id)) !== "main") fail("skip link did not move focus to the main content");
    await audit("customer home");
    await tabTo('button[data-choice="change"]');
    await key("Enter");
    await onHeading(say("form.q.part"), "open form");
    await audit("form step 1");
    await radio("Sleeve");
    await press(say("next"));
    await onHeading(say("form.q.style"), "step 2");
    await audit("form step 2");
    await radio("Bell sleeves");
    await press(say("next"));
    await onHeading(say("form.q.note"), "step 3");
    await audit("form step 3");
    await typeInto("req-note", "Flared opening");
    await press(say("form.send"));
    await onHeading(say("waiting.title"), "send request");
    await audit("waiting");
    // The first Tab stop after the heading must be the safe disclosure, not Cancel.
    await page.locator("[data-focus-target]").focus();
    await key("Tab");
    const first = await page.evaluate(() => document.activeElement?.textContent);
    if (first !== say("waiting.nextLabel")) fail(`waiting: first Tab stop is "${first}"`);
    await press(say("cancel.button"));
    await key("Escape");
    if (await page.getByRole("button", { name: say("cancel.yes"), exact: true }).count()) fail("Escape did not close the cancel confirmation");
    await onHeading(say("waiting.title"), "close confirmation");

    await radio("tailor");
    await audit("tailor review (blank)");
    await radio("Impossible");
    await audit("tailor review (cannot be made)");
    await typeInto("review-reason", "Fabric is already cut");
    await typeInto("review-alt", "Cuff Trim");
    await typeInto("review-cost", "No extra cost");
    await typeInto("review-date", "Delivery unchanged");
    await press(say("review.send"));
    await onHeading(say("review.title"), "send review");
    await audit("tailor sent");

    await radio("customer");
    await audit("customer decision");
    await press(say("decision.approve", { style: term("Cuff Trim", lang) }));
    await onHeading(say("approved.title", { style: term("Cuff Trim", lang) }), "approve");
    await audit("approved");
    await press(say("back.choices"));
    await onHeading(say("home.title"), "back to choices");
    await audit("home with undo");

    // The menu opens, holds focus, closes on Escape and gives focus back.
    const menu = say("nav.open", { list: say("nav.customer") });
    await tabTo(`button[aria-label="${menu}"]`, { back: true });
    await key("Enter");
    await page.getByRole("dialog").waitFor();
    for (let i = 0; i < 8; i++) {
      await key("Tab");
      const outside = await page.evaluate(() => {
        const el = document.activeElement;
        return el !== document.body && !el?.closest("[role=dialog]");
      });
      if (outside) fail("orders menu: focus moved behind the open menu");
    }
    await key("Escape");
    await page.waitForFunction((m) => document.activeElement?.getAttribute("aria-label") === m, menu, { timeout: 4000 })
      .catch(() => fail("orders menu: focus did not return to the menu button"));

    await radio("worker");
    await audit("worker");
    await tabTo("#read-current");
    await key("Space");
    await press(say("worker.start"));
    await onHeading(null, "start stitching");
    await audit("worker stitching");
    await press(say("worker.finish"));
    await onHeading(null, "finish");
    await audit("worker finished");
    const done = await page.getByText(say("worker.finished"), { exact: true }).count();
    if (!done) fail("the job was not marked as finished");
  } catch (error) {
    fail(error.message);
  }
  for (const p of problems) fail(p);
  console.log(`${label}: ${audited} screens audited, ${presses} key presses on the task path`);
  await context.close();
}

await browser.close();
stop();
const unique = [...new Set(failures)];
console.log(`\n${unique.length} problem(s).`);
for (const f of unique) console.log(`- ${f}`);
process.exit(unique.length ? 1 : 0);
