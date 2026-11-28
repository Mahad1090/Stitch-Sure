# StitchSure D6 iteration log (Team 8, Quad Stitch)

**Source of findings:** `StitchSure-D5-Team8-QuadStitch.pdf`. Part A register: 26 findings, severity 1 to 4. "D5B rec" is the number in D5 section 11 (five recommendations); "none" means the finding is from D5A only.

**Result:** 24 implemented, 1 implemented differently from the D5 suggestion (S-08), 1 already satisfied in the code (M-10). None deferred.

"Tests" are Vitest names or file names in `src/test/`. Browser checks are in `scripts/`. They show the change behaves as described; they are **not** new user evidence. No user testing has been done on this revision.

## D5 findings (all 26)

| Finding | Sev | D5B rec | What was wrong (D5) | What changed | File(s) | Test |
|---|---|---|---|---|---|---|
| S-01 | 4 | 3 | Tailor form pre-set to "Cannot be made / Cuff Trim", so a neckline request could reach the worker wrong | Review starts blank; no outcome selected; fields appear only after a choice and clear when it changes | `useStitchSure.ts`, `TailorView.tsx` | `d5-fixes`: "S-01 / S-05 / A-18" (3 tests) |
| M-02 | 4 | 2 | Customer's note lost; worker saw "As described in my note" | The note is the design name everywhere (`requestedLabel`). The form option is now "Describe it in my own words" | `workflow.ts`, views, `sample.ts` | `d5-fixes`: "M-02" (2 tests) |
| M-03 | 3 | 1 | Undo vanished after leaving the approval card | "Undo approval" stays on the customer home until stitching starts | `CustomerView.tsx`, `ui.tsx` | `d5-fixes`: "M-03" (2 tests) |
| S-04 | 3 | 4 | Focus dropped to the page body; first Tab hit "Cancel request" | Focus moves to the new card or step heading; "What happens next" comes before Cancel | `useScreen.ts`, `ui.tsx`, `index.tsx` | `d5-fixes`: "S-04" (4 tests); `keyboard.mjs` |
| S-05 | 3 | 3 | One click sent a decision the tailor never made | Send is disabled until an outcome is chosen | `TailorView.tsx` | `d5-fixes`: "selects nothing, hides the fields and disables Send" |
| A-06 | 2 | none | Escape did not close the menu drawer | Escape closes it | `Drawer.tsx` | `d5-remaining`: "A-06" |
| M-07 | 2 | none | Tab left the open drawer | Page behind is inert, Tab wraps inside, focus returns to the menu button | `Drawer.tsx`, `index.tsx` | `d5-remaining`: "M-07"; `keyboard.mjs` |
| S-08 | 2 | none | Garment buttons duplicated the part choice late in the Tab order | **Differently:** D5 suggested reordering or removing them. They remain as pointer shortcuts only (`tabIndex=-1`) | `Garment.tsx` | `d5-fixes`: "S-08" |
| S-09 | 2 | none | "Sleeve selected" appeared far away in the header | The message sits under the part choices; photo status sits beside its button | `CustomerView.tsx` | `d5-remaining`: "S-09" |
| M-10 | 2 | none | Text field borders about 2.2:1 | **Already satisfied** before this revision: the rendered border was near-black through a later style override. The theme now sets it with one token, `#5b6b82` | `styles.css`, `ui/input.tsx`, `ui/textarea.tsx` | `theme.test.ts`; `contrast.mjs` |
| M-11 | 2 | none | "Large text" was only a 15% zoom; headings and small labels stayed small | Sizes are in rem; Large text raises the root size to 125% and lifts small labels further | `styles.css`, `button.tsx` | `d5-remaining`: "M-11"; `a11y.mjs` (Large and 200% text) |
| S-12 | 2 | none | Past orders looked clickable | Plain rows with no border, button or link | `Drawer.tsx`, `styles.css` | `d5-remaining`: "S-12" |
| A-18 | 2 | none | After a customer reply the old question stayed filled in | The form resets whenever the request changes | `useStitchSure.ts` | `d5-fixes`: "is blank again after the customer replies" |
| A-19 | 2 | none | Tailor had no way to answer a reported problem | Reply box (required in the screen); the worker sees the reply; cleared on a new problem | `workflow.ts`, `TailorView.tsx`, `WorkerView.tsx` | `d5-remaining`: "A-19" |
| M-20 | 2 | none | A cancelled request was labelled "Rejected" | New event status "Cancelled" | `workflow.ts`, `ui.tsx` | `d5-remaining`: "M-20" |
| A-13 | 1 | none | Version numbers led the customer's labels | "Agreed design" is the main label; the version is small beside it on the order card and fact tile | `ui.tsx`, `index.tsx` | `d5-remaining`: "A-13" |
| M-14 | 1 | none | "Need info" did not match "question" | The option is "Ask a question"; the stored outcome value is unchanged | `i18n.ts` | `d5-remaining`: "M-14" |
| A-15 | 1 | none | "Reset sample" 36 px, role options 40 px | Both at least 44 px | `styles.css`, `button.tsx` | `d5-remaining`: "A-15"; `a11y.mjs` target check |
| M-16 | 1 | none | No skip link | "Skip to main content" is the first focusable element, including the not-found and error pages | `ui.tsx`, `index.tsx`, `__root.tsx` | `d5-remaining`: "M-16" (2); `keyboard.mjs` |
| M-17 | 1 | none | "Mark as seen" did nothing useful | Button removed; opening the tailor view marks the request seen | `useStitchSure.ts`, `TailorView.tsx` | `d5-remaining`: "M-17" |
| M-21 | 1 | none | Escape did not close the cancel confirmation | Escape closes it and keeps the request | `CustomerView.tsx` | `d5-remaining`: "M-21"; `keyboard.mjs` |
| M-22 | 1 | none | "Tailor notified" appeared twice | Shown once | `CustomerView.tsx`, `i18n.ts` | `d5-remaining`: "M-22" |
| A-23 | 1 | none | "Start stitching" on hold was skipped by Tab and gave no reason | `aria-disabled` with the visible hold reason linked; activating does nothing. "Finish stitching" behaves the same | `WorkerView.tsx` | `d5-remaining`: "A-23" |
| A-24 | 1 | none | Sample delivery dates were earlier than timeline stamps | All sample dates are placed around today: order, agreement, today, delivery, event | `dates.ts`, `sample.ts`, `workflow.ts` | `d5-remaining`: "A-24" (clock mocked) |
| M-25 | 1 | none | Very long notes filled phone screens | 250-character limit with a counter; long notes and history entries shorten with "Show more". **The worker's instructions are never shortened** (safer choice) | `CustomerView.tsx`, `TailorView.tsx`, `ui.tsx`, `Activity.tsx` | `d5-remaining`: "M-25" (2) |
| M-26 | 1 | 5 | On phones the task was far below banner, rail and tiles | At 700 px or less the task card follows the status banner | `index.tsx`, `useScreen.ts` | `d5-fixes`: "M-26" (2) |

### D5B session observations covered by the rows above
- Stale reason text after switching outcome (2 of 4): cleared on change (S-01 row).
- Awkward "Approve As described in my note" (1 of 4): the button now names the customer's words (M-02 row).
- Expected Undo on the main orders list (4 of 4, debrief): Undo is on the customer home (M-03 row).

## Changes that are **not** D5 findings

| Change | Source | What was wrong | What changed | File(s) | Test |
|---|---|---|---|---|---|
| Calm customer home | Instructor feedback ("it looks very overwhelming") | Order, facts, progress and history all on one screen | One question with three choices; details under "See my order" or during a request. "Report a problem" is now part of "Message Master Mahad" | `CustomerView.tsx`, `index.tsx` | `calm-ui`: "Customer home" |
| One question per screen in the request form | Instructor feedback | One long form | Three steps with a progress bar, Back and Next | `CustomerView.tsx` | `calm-ui`: "Request form" |
| One decision at a time for the tailor | Instructor feedback | Customer card, request and review competed | Request, then one review panel; customer details, measurements, history and fabric stage behind disclosures; progress rail kept, fact tiles moved into details | `TailorView.tsx` | `calm-ui`: "Tailor" |
| The job only for the worker | Instructor feedback | Extra panels beside the job | One job card, one primary button, "Updated" notice; measurements behind a disclosure | `WorkerView.tsx` | `calm-ui`: "Worker" |
| Orders list behind the menu button at every width; quieter prototype bar | Instructor feedback | Permanent side column | Drawer; current order shown in the top bar | `Drawer.tsx`, `index.tsx` | `calm-ui`: "Orders drawer" |
| Urdu and right-to-left | User context (Urdu-speaking tailors) | English only | Language toggle, Urdu for all three roles, mirrored layout, self-hosted Nastaliq. **Translations unreviewed** | `i18n.ts`, `LanguageToggle.tsx`, `styles.css` | `urdu.test.tsx` |
| One-colour theme with dark variant: Rose, solid fill | Visual refresh, team decision (blue first, then Rose after previewing alternatives) | Several stacked style layers | One token block in rose; contrast measured | `styles.css` | `theme.test.ts` |

| Original logo kept | Team decision | The theme pass had replaced the script wordmark | Lowercase Sacramento wordmark (self-hosted) and round mark restored, in the theme colour | `styles.css`, `__root.tsx` | `theme.test.ts` |


| More design choices and "Other" | Team request | Only sleeve and neckline, three styles each | Six parts (sleeve, neckline, length, pocket, trouser, other), more styles, each drawn, with a tap label on the picture; "Other" is described in the customer's words | `workflow.ts`, `sample.ts`, `Garment.tsx`, views | `options.test.tsx` |

| "See my order" matches "Change my design" | Team request | Several cards, tiles, a progress rail and a side timeline | One narrow card: drawing and agreed design in larger text; details, measurements, progress and history behind disclosures | `CustomerView.tsx`, `index.tsx` | `calm-ui`: "shows one quiet card" |

| Plain request summary | Team request | "Other: Nothing extra → …" was hard to read | Two bold labelled lines, "Before" then "What you want" (only the wanted design in bold); only "What you want" for "Other" | `CustomerView.tsx`, `TailorView.tsx` | `options.test.tsx` |

| Back icon beside the banner | Team request | The way back was a text link inside each card | One round back-arrow button beside the status banner on the form, order and message screens | `index.tsx`, `CustomerView.tsx` | `calm-ui`: "Back button" |

| Simpler request-in-progress screens | Team request (overrides the first brief, which showed facts and timeline here) | Same message twice, three fact tiles and a timeline beside one request | Title, progress steps and one short card; facts and timeline are under "See my order" | `index.tsx`, `CustomerView.tsx` | `calm-ui`: "keeps the waiting screen simple" |

| Back button on every screen | Team request | Only some screens had a way back | One round back arrow wherever there is somewhere to go, including a waiting request (which stays unchanged) and the tailor and worker views (returns to the previous view) | `useStitchSure.ts`, `index.tsx` | `calm-ui`: "Back button" |

## Found in our own D6 testing (not D5 findings)

Found by automated browser testing and screenshot review run with Claude Code. These are **not** user evidence.

| Change | What was wrong | What changed | File(s) | Test |
|---|---|---|---|---|
| Refused design's note withheld | After a "Cannot be made" review and approval of the offer, the worker and the order screen still showed the note and photo for the refused design | Note and photo are shown only when the requested design itself was approved | `workflow.ts`, `WorkerView.tsx`, `CustomerView.tsx` | `d6-fixes` |
| Stale errors cleared | An error stayed visible after switching view, and in the report form | Switching view and opening or closing the report form clear messages | `useStitchSure.ts`, `workflow.ts` | `d6-fixes` |
| Refused request label | The tailor's card showed the refused design as "Approved" | It shows "Cannot be made" | `TailorView.tsx` | `d6-fixes` |
| Hold shown to the customer | The approval card did not say work was on hold | It shows the hold message | `CustomerView.tsx` | `d6-fixes` |
| Long words wrap | A very long word with no spaces overflowed the decision and later screens | Text wraps inside its box, including in WebKit flex rows | `styles.css` | Browser check in Chromium, Firefox and WebKit |
| Offer made optional (team request) | "Cannot be made" forced the tailor to offer another design | The offer is optional; cost and delivery are asked only with an offer; without one the customer can only keep the original | `workflow.ts`, views, `status.ts`, `i18n.ts` | `workflow`, `d6-fixes` |
| Tab icon (team request) | The browser tab showed the template icon | It shows the StitchSure round mark | `public/favicon.svg`, `__root.tsx` | Browser check |
| Dev server restart | After a restart the page loaded but did not respond to clicks | The affected package is pre-bundled | `vite.config.ts` | Cold start and three restarts in a browser |

## Still open
- The Urdu text needs a native speaker's review.
- No user testing or screen-reader session was run on this revision.
- The 404 and error pages have the skip link but are English only.
