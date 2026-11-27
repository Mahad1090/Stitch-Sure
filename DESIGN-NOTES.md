# StitchSure: design notes (D6 revision)

Why each change was made, and which D5 finding it traces to, is in [ITERATION-LOG.md](ITERATION-LOG.md).

## Principles applied
Visibility of system status, match with the real world, user control and easy undo, consistency, error prevention, recognition over recall, plain wording, progressive disclosure, accessibility (WCAG 2.2 AA as the target), and one clear next action per screen.

## Calm screens
- **Customer home:** one card, "What would you like to do?", a small design summary and three large choices. No progress rail, fact tiles or timeline on the home screen. A request in progress shows only the title, the progress steps and one short card. "See my order" is one quiet card in the same style as the request form, with progress and history behind a disclosure.
- **Request form:** three steps (part: sleeve, neckline, length, pocket, trouser or other; style; note and photo) with "Step N of 3", a progress bar, Back and Next. Next is disabled with a visible hint until a choice is made. Choices are kept going back. Tapping the garment still picks the part.
- **Tailor:** what the customer wants, then one review panel with three equal outcomes and only the fields that outcome needs, with a live preview of the message. Customer details, measurements, history and fabric stage are disclosures.
- **Worker:** one job card with one primary button. An "Updated" notice appears for a newer version, which must be acknowledged before starting. Measurements and earlier versions are disclosures.
- **Prototype bar:** small, dashed edge, labelled "Prototype only".

## Behaviours
- **Focus:** after a screen change focus moves to the new heading. It does not move on first load, while an error shows, or when only the "View as" role changes.
- **Skip link:** first focusable element; appears on focus and moves focus to the main content.
- **Menu drawer:** the rest of the page is inert, Tab wraps inside, Escape closes, focus returns to the menu button.
- **Escape** also closes the cancel-request confirmation.
- **Large text:** root size 125%, with the smallest labels raised to 0.9375rem. All font sizes are in rem, so browser text settings apply too.
- **Sample dates:** generated from today (ordered 6 days ago, agreed 5 days ago, delivery in 3 days, event in 4).
- **Long notes:** 250-character limit; shortened with "Show more", except in the worker's instructions.
- **Problem reports:** the tailor replies in a text box; the worker sees the reply when work resumes.

## Theme
Main colour: **Rose** (team decision, chosen from a temporary preview that has since been removed; it replaces the earlier blue).
- `--brand #d76188` for accents (top stripe, logo tile, progress, banner edge, selection edges, icon chips).
- `--primary #d76188`, a solid rose fill for buttons and selected options, with dark text (white text on this rose would fall below 4.5:1).
- `--link #c63263` for text links.
- Pale rose page, white cards, muted text `#4f5d73`, control edges `#5b6b82`, navy focus ring `#0a2a5e` (a light ring in dark mode).
- Error red stays separate from rose, and every status also has words and an icon.
- System fonts, no remote requests, no decoration. One exception, by team decision: the **logo** keeps its original lowercase script (Sacramento, self-hosted via `@fontsource`) and round mark.
- One light and one dark token block in `src/styles.css`.

## Urdu and right-to-left
- Typed dictionary in `src/lib/i18n.ts`; no i18n library. The workflow keeps its English record and also stores each message as data, so history and errors translate.
- The toggle sets `<html lang dir>` and is remembered in `localStorage` (the app still works if storage is blocked).
- Logical CSS properties; directional icons flip. The garment drawing and its hotspots are not mirrored.
- Noto Nastaliq Urdu, self-hosted, line height about 2.1, limited by unicode range to Arabic script so English text is unaffected.
- User-typed text is direction-isolated. Names, order IDs and dates stay in Latin script.
- Translations are machine-drafted and unreviewed: [TRANSLATION-REVIEW.md](TRANSLATION-REVIEW.md).

## Contrast measurements
Produced by `node scripts/contrast.mjs`.

| Theme | Use | Foreground | Background | Ratio | Target | Result |
|---|---|---|---|---|---|---|
| light | Body text on page | foreground #12233a | background #f9f1f4 | 14.25:1 | 4.5:1 | pass |
| light | Body text on card | foreground #12233a | card #ffffff | 15.82:1 | 4.5:1 | pass |
| light | Body text on quiet fill | foreground #12233a | fill #f4e4e9 | 12.90:1 | 4.5:1 | pass |
| light | Body text on highlighted row | foreground #12233a | wait-soft #fbefd6 | 13.88:1 | 4.5:1 | pass |
| light | Muted text on page | muted-foreground #4f5d73 | background #f9f1f4 | 6.01:1 | 4.5:1 | pass |
| light | Muted text on card | muted-foreground #4f5d73 | card #ffffff | 6.68:1 | 4.5:1 | pass |
| light | Muted text on quiet fill | muted-foreground #4f5d73 | fill #f4e4e9 | 5.44:1 | 4.5:1 | pass |
| light | Button text | primary-foreground #350d1b | primary #d76188 | 4.86:1 | 4.5:1 | pass |
| light | Link on card | link #c63263 | card #ffffff | 5.20:1 | 4.5:1 | pass |
| light | Link on page | link #c63263 | background #f9f1f4 | 4.69:1 | 4.5:1 | pass |
| light | Success chip and notice | success #1d6b3c | success-soft #e6f2ea | 5.67:1 | 4.5:1 | pass |
| light | Success text on card | success #1d6b3c | card #ffffff | 6.52:1 | 4.5:1 | pass |
| light | Error chip and notice | destructive #a3261f | danger-soft #faebe9 | 6.35:1 | 4.5:1 | pass |
| light | Waiting chip and notice | wait #744700 | wait-soft #fbefd6 | 6.97:1 | 4.5:1 | pass |
| light | Field and control edge on card | input #5b6b82 | card #ffffff | 5.43:1 | 3:1 | pass |
| light | Control edge on quiet fill | input #5b6b82 | fill #f4e4e9 | 4.42:1 | 3:1 | pass |
| light | Brand accent (bar, edge, icon chip) on card | brand #d76188 | card #ffffff | 3.53:1 | 3:1 | pass |
| light | Brand accent on page | brand #d76188 | background #f9f1f4 | 3.18:1 | 3:1 | pass |
| light | Focus ring on card | ring #0a2a5e | card #ffffff | 13.95:1 | 3:1 | pass |
| light | Focus ring on page | ring #0a2a5e | background #f9f1f4 | 12.56:1 | 3:1 | pass |
| light | Focus ring on quiet fill | ring #0a2a5e | fill #f4e4e9 | 11.37:1 | 3:1 | pass |
| dark | Body text on page | foreground #eaf4fa | background #130c0e | 17.32:1 | 4.5:1 | pass |
| dark | Body text on card | foreground #eaf4fa | card #23151a | 15.77:1 | 4.5:1 | pass |
| dark | Body text on quiet fill | foreground #eaf4fa | fill #331f26 | 13.79:1 | 4.5:1 | pass |
| dark | Body text on highlighted row | foreground #eaf4fa | wait-soft #352a0f | 12.63:1 | 4.5:1 | pass |
| dark | Muted text on page | muted-foreground #afc4d3 | background #130c0e | 10.73:1 | 4.5:1 | pass |
| dark | Muted text on card | muted-foreground #afc4d3 | card #23151a | 9.77:1 | 4.5:1 | pass |
| dark | Muted text on quiet fill | muted-foreground #afc4d3 | fill #331f26 | 8.54:1 | 4.5:1 | pass |
| dark | Button text | primary-foreground #350d1b | primary #d76188 | 4.86:1 | 4.5:1 | pass |
| dark | Link on card | link #e9a5bc | card #23151a | 8.86:1 | 4.5:1 | pass |
| dark | Link on page | link #e9a5bc | background #130c0e | 9.73:1 | 4.5:1 | pass |
| dark | Success chip and notice | success #96d6ab | success-soft #15301f | 8.48:1 | 4.5:1 | pass |
| dark | Success text on card | success #96d6ab | card #23151a | 10.48:1 | 4.5:1 | pass |
| dark | Error chip and notice | destructive #ffa49b | danger-soft #3a1c1a | 8.11:1 | 4.5:1 | pass |
| dark | Waiting chip and notice | wait #f3c870 | wait-soft #352a0f | 8.93:1 | 4.5:1 | pass |
| dark | Field and control edge on card | input #8ba6b9 | card #23151a | 6.91:1 | 3:1 | pass |
| dark | Control edge on quiet fill | input #8ba6b9 | fill #331f26 | 6.05:1 | 3:1 | pass |
| dark | Brand accent (bar, edge, icon chip) on card | brand #d76188 | card #23151a | 4.99:1 | 3:1 | pass |
| dark | Brand accent on page | brand #d76188 | background #130c0e | 5.48:1 | 3:1 | pass |
| dark | Focus ring on card | ring #cfdcff | card #23151a | 12.85:1 | 3:1 | pass |
| dark | Focus ring on page | ring #cfdcff | background #130c0e | 14.11:1 | 3:1 | pass |
| dark | Focus ring on quiet fill | ring #cfdcff | fill #331f26 | 11.24:1 | 3:1 | pass |
| both | White icon on brand tile | #ffffff | brand #d76188 | 3.53:1 | 3:1 | pass |

## Checks run by the builder (automated only)
Results of the last run are listed in [RUN.md](RUN.md). Automated tools find only some problems. **Not done:** screen-reader session, real-device test, testing with users, native-speaker review of the Urdu.
