// Shared helpers for the browser checks: a local server and one walk through every key screen.
// Needs Node 22.18 or newer (it imports the TypeScript dictionary directly).
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { t, term } from "../src/lib/i18n.ts";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const BASE = process.env.BASE_URL ?? "http://localhost:8080";
export const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  phone: { width: 390, height: 844 },
};

const up = () => fetch(BASE).then((r) => r.ok, () => false);

/** Uses a server that is already running, or starts the dev server and returns a way to stop it. */
export async function ensureServer() {
  if (await up()) return () => {};
  const server = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "dev", "--port", new URL(BASE).port, "--strictPort"],
    { cwd: ROOT, stdio: "ignore" },
  );
  for (let i = 0; i < 120; i++) {
    if (await up()) return () => server.kill();
    await new Promise((r) => setTimeout(r, 500));
  }
  server.kill();
  throw new Error(`No server at ${BASE}`);
}

/** Opens the app in a fresh context. External requests are recorded: there should be none. */
export async function openApp(browser, { lang = "en", viewport = "desktop", theme = "light" } = {}) {
  const context = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    colorScheme: theme,
    reducedMotion: "reduce",
  });
  await context.addInitScript((value) => localStorage.setItem("stitchsure.lang", value), lang);
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("request", (r) => {
    const url = r.url();
    if (!url.startsWith("data:") && new URL(url).host !== new URL(BASE).host)
      problems.push(`external request: ${url}`);
  });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 90_000 });
  await page.locator(`html[lang="${lang}"]`).waitFor();
  await page.evaluate(() => document.fonts.ready);
  return { context, page, problems };
}

/** Customer, tailor and worker, start to finish. `visit(name)` runs on each key screen. */
export async function journey(page, lang, visit) {
  const say = (key, vars) => t(key, vars, lang);
  const press = (key, vars) => page.getByRole("button", { name: say(key, vars), exact: true }).click();
  const choose = (value) => page.locator(`label:has(input[value="${value}"])`).click();
  const open = (key, vars) => press(key, vars);
  const fill = (id, value) => page.locator(`#${id}`).fill(value);
  const choice = (id) => page.locator(`button[data-choice="${id}"]`).click();
  const heading = (name) => page.getByRole("heading", { name, exact: true }).waitFor();

  await visit("customer-home");
  await choice("order");
  await visit("customer-order");
  await open("order.history");
  await visit("customer-order-history");
  await press("back.go");
  await choice("message");
  await visit("customer-message");
  await press("back.go");

  await choice("change");
  await visit("form-step-1");
  await choose("Other");
  await press("next");
  await visit("form-other");
  await press("back");
  await choose("Sleeve");
  await press("next");
  await choose("Bell sleeves");
  await visit("form-step-2");
  await press("next");
  await fill("req-note", "Flared opening at the wrist");
  await press("form.addPhoto");
  await visit("form-step-3");
  await press("form.send");
  await heading(say("waiting.title"));
  await visit("customer-waiting");
  await press("cancel.button");
  await visit("customer-cancel-confirm");
  await press("cancel.no");

  await choose("tailor");
  await visit("tailor-review-blank");
  await open("tailor.customer");
  await open("measurements.title");
  await open("tailor.history");
  await visit("tailor-details-open");
  await choose("Needs clarification");
  await fill("review-question", "How wide at the wrist?");
  await press("review.sendQuestion");
  await visit("tailor-question-sent");
  await choose("customer");
  await visit("customer-question");
  await fill("req-answer", "9 inches");
  await press("question.reply");

  await choose("tailor");
  await choose("Impossible");
  await fill("review-reason", "Fabric is already cut");
  await fill("review-alt", "Cuff Trim");
  await fill("review-cost", "No extra cost");
  await fill("review-date", "Delivery unchanged");
  await visit("tailor-review-filled");
  await press("review.send");
  await visit("tailor-review-sent");

  await choose("customer");
  await visit("customer-decision");
  await press("decision.approve", { style: term("Cuff Trim", lang) });
  await visit("customer-approved");
  await press("back.choices");
  await visit("customer-home-undo");
  await page.getByRole("button", { name: say("nav.open", { list: say("nav.customer") }) }).click();
  await visit("orders-menu");
  await press("nav.close");

  await choose("worker");
  await visit("worker-updated");
  await press("worker.start");
  await page.getByRole("alert").waitFor();
  await visit("worker-error");
  await press("worker.report");
  await visit("worker-report");
  await choose("Fabric issue");
  await fill("problem", "There is a mark on one panel");
  await press("report.send");
  await visit("worker-on-hold");
  await choose("tailor");
  await visit("tailor-problem");
  await fill("problem-reply", "Use the other side of the panel");
  await press("tailor.problem.solve");
  await choose("worker");
  await visit("worker-reply");
  await page.locator("#read-current").click();
  await press("worker.start");
  await visit("worker-stitching");
  await choose("customer");
  await visit("customer-home-locked");
  await choose("worker");
  await press("worker.finish");
  await visit("worker-finished");
}
