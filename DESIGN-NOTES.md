# StitchSure: design notes for the redesign

Scope: the screens and styles were rebuilt. `src/lib/workflow.ts` (the rules) is unchanged, and its 18 original tests still pass.

## What was wrong, and what changed

| Problem in the old screens | Change |
|---|---|
| Tailor saw the request mixed into one long card, with no customer details | Tailor view now reads in task order: **1 Customer** (who, contact, order, measurements on file, with the relevant measurement highlighted), **2 What they want** (now vs requested drawing, note, reference), **3 Your review** (decision form, one card). |
| Text at 9–11 px, many unnamed boxes | Type scale 12–34 px, never below 12 px. One idea per card (common region). |
| Same wording shown to every role | `lib/status.ts` writes the headline and next step from the viewer's point of view. |
| Error text at the top of the page | The error appears next to the action that caused it and takes focus (`role="alert"`). |
| Dropdowns for 2–3 choices | Segmented controls and radio rows with a one-line description (recognition over recall). |
| Disabled "Start stitching" with no explanation | Stays focusable (`aria-disabled`), dimmed, and clicking it explains what is missing. |
| A confirmation meant for one role showed on another | Messages are hidden when the view switches role. |

## Apple HIG principles applied
- **Clarity:** status-first hierarchy (large title, one supporting sentence), plain labels, status in words plus icon.
- **Deference:** quiet surfaces, content leads; the brand orange is used only for the current step and the primary action.
- **Depth/material:** translucent blurred top bar, grouped (inset) cards on a grouped background.
- **Controls:** segmented controls, inset grouped lists, 44 px minimum targets, large primary buttons.
- **Typography:** system font stack (`-apple-system`/SF on Apple devices), no web-font download.
- **Colour:** semantic roles (label, secondary label, tint, success, destructive), light and dark appearance, text contrast of at least 4.5:1.
- **Adaptivity:** layout reorganises at 1240, 900 and 700 px; buttons go full width on phones.
- **Not used:** Apple's Design Resources kits, SF Pro and SF Symbols were not downloaded or bundled (their licence is for Apple-platform apps, and this build environment could not fetch them). Icons are lucide; the look follows the guidelines rather than copying the kits.

## HCI principles applied
- Visibility of status: progress rail (Request, Review, Approval, Stitching) plus the version timeline.
- Match with the real world: tailor-shop words; "Seen" is never shown as "Accepted".
- Error prevention and recovery: advisory (not a block) when the fabric is already cut; every error says where, what next, and keeps the user's entries.
- Gestalt: proximity (labels sit with their fields), similarity (same-role buttons look alike), common region (one card per idea), continuity (single left edge).
- Consistency: one component per job (`Card`, `Facts`, `Segmented`, `OptionList`, `Chip`, `Notice`).

## Checks that were run (automated, by the builder)
- `vitest`: 23 tests pass (18 original rules + 5 new for role headlines and the progress rail).
- `tsc --noEmit` and `vite build`: clean.
- axe-core (WCAG 2.0/2.1/2.2 A and AA rules) on customer, tailor, worker, error and dark-mode states: 0 violations. Automated tools find only part of the problems.
- Keyboard walk: tab order follows the task; every control showed a visible focus ring.
- **Not done:** no screen-reader session, no zoom/200% text test, no user testing. Log those yourselves in the D4 accessibility audit; do not claim them from this file.

## Files
New: `src/components/stitchsure/*`, `src/lib/sample.ts`, `src/lib/status.ts`, `src/test/status.test.ts`.
Rewritten: `src/routes/index.tsx`, `src/styles.css`.
Edited: `src/components/ui/{button,input,textarea,checkbox}.tsx` (restyled), `src/routes/__root.tsx` (removed the Geist font links).
Unused: `src/lib/orders.ts` is older sample data and is not imported anywhere.
