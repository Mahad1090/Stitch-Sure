// Rewrites TRANSLATION-REVIEW.md from the dictionary. Needs Node 22.18 or newer.
// Run: node scripts/translation-review.mjs
// A row marked "yes" stays "yes" only while its English and Urdu text are unchanged.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { en, ur } from "../src/lib/i18n.ts";

const file = new URL("../TRANSLATION-REVIEW.md", import.meta.url);
// Direction marks are invisible; show them as nothing in the table.
const cell = (s) => s.replace(/[⁦-⁩‎‏]/g, "").replace(/\|/g, "\\|");
const reviewed = new Set(
  existsSync(file) ? readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.endsWith("| yes |")) : [],
);
const rows = Object.keys(en).map((key) => {
  const start = `| \`${key}\` | ${cell(en[key])} | ${cell(ur[key])} |`;
  return `${start} ${reviewed.has(`${start} yes |`) ? "yes" : "no"} |`;
});

writeFileSync(
  file,
  `# Urdu translation review

**These Urdu translations are machine-drafted (by Claude Code) and have not been reviewed by an Urdu speaker.**
Do not present them as checked until a native speaker on the team has read them.

## How to review
1. Run the app, switch to اردو, and read each screen in context (see \`docs/screenshots/ur-*\`).
2. For each row, correct the Urdu in \`src/lib/i18n.ts\` if needed, then change "no" to "yes" here.
3. Run \`node scripts/translation-review.mjs\` to refresh the table. A "yes" is kept only while that row's text is unchanged.

## Please check in particular
- Tailoring words: آستین (sleeve), گلا (neckline), تیرا (shoulder), کف ٹرم (cuff trim), بیل آستین (bell sleeves), بوٹ گلا (boat neck).
- Names stay in Latin script (Areeba, Shayan, StitchSure); "Master Mahad" is written ماسٹر مہاد.
- Gender and respect: verbs about Master Mahad use the respectful plural; wording about Areeba avoids gendered verbs where possible.
- Rendering: in bold Nastaliq, سیدھی shows a visible gap before ھ. Check whether that reads acceptably.
- \`{curly}\` words are filled in by the app and must stay as they are.

## Strings (${rows.length})

| Key | English | Urdu | Reviewed |
|---|---|---|---|
${rows.join("\n")}
`,
);
console.log(`${rows.length} strings written to TRANSLATION-REVIEW.md`);
