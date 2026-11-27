# Run StitchSure on your computer

You need Node.js 20 or newer (https://nodejs.org) and an internet connection for the first install. The browser check scripts need Node.js 22.18 or newer.

## Steps
1. Unzip the folder, then open a terminal inside the `StitchSure` folder.
2. Install Bun (a package manager). One time only:
   `npm install -g bun`
3. Install the project's packages:
   `bun install`
4. Start the app:
   `bun run dev`
5. Open the address it prints in your browser: **http://localhost:8080**

Use `Ctrl + C` in the terminal to stop it.

If `npm install` shows the error "Cannot read properties of null (reading 'edgesOut')", that is a known npm bug with this project's lock settings. Use the Bun steps above instead.

## Checks
| Command | What it does |
|---|---|
| `bun run test` | 101 Vitest tests (rules, screens, D5 fixes, Urdu, theme) |
| `npx tsc --noEmit` | Type check |
| `bun run build` | Production build |
| `node scripts/contrast.mjs` | Colour contrast of the theme |
| `node scripts/translation-review.mjs` | Refreshes `TRANSLATION-REVIEW.md` |

The browser checks need Chromium once: `bunx playwright install chromium`. They use the app at port 8080 and start it if it is not running.

| Command | What it does |
|---|---|
| `node scripts/a11y.mjs` | axe-core (WCAG 2.0 to 2.2 A and AA), 44 px targets, horizontal scroll and clipped text on every key screen: English and Urdu, 1280 and 390 px, light, dark, Large text and 200% text |
| `node scripts/keyboard.mjs` | The whole flow with the keyboard only, including the skip link, menu and Escape |
| `node scripts/screenshots.mjs` | Saves `docs/screenshots/` |

`bun run preview` does not work with the current build settings (the build is written to `.output` for Cloudflare, and the preview command looks elsewhere). Use `bun run dev` for demonstrations.

## Using it
- The "Prototype only" bar at the top is not part of the app. Its "View as" switch stands in for three people on three phones (login is simulated).
- "English | اردو" switches language; the choice is remembered in this browser. The Urdu text has not been reviewed yet.
- "Reset sample" starts the story over. Refreshing the page also resets it.
- Messages and notices between customer, tailor and worker are simulated in this one page; nothing is sent.
- All names, orders and measurements are invented sample data. Sample dates are set around today. Only the language choice is saved.
