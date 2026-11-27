// Saves a screenshot of every key screen, English and Urdu, desktop and phone.
// Run: node scripts/screenshots.mjs
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { ensureServer, journey, openApp, ROOT, VIEWPORTS } from "./flow.mjs";

const stop = await ensureServer();
const browser = await chromium.launch();
let count = 0;
for (const lang of ["en", "ur"]) {
  for (const viewport of Object.keys(VIEWPORTS)) {
    const dir = join(ROOT, "docs", "screenshots", `${lang}-${viewport}`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const { context, page } = await openApp(browser, { lang, viewport });
    let step = 0;
    await journey(page, lang, async (name) => {
      // The open menu covers the window, so capture the window only.
      await page.screenshot({
        path: join(dir, `${String(++step).padStart(2, "0")}-${name}.png`),
        fullPage: name !== "orders-menu",
        animations: "disabled",
      });
      count++;
    });
    await context.close();
    console.log(`${lang}-${viewport}: ${step} screenshots`);
  }
}
await browser.close();
stop();
console.log(`${count} screenshots in docs/screenshots/`);
