/** User context: customers and tailors in Pakistan, tailors often working in Urdu. */
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { dictionaries, en, LANG_STORAGE_KEY, t, ur, type Key } from "@/lib/i18n";
import { initialWorkflow, workflowReducer as reduce } from "@/lib/workflow";
import { click, flushSend, pick, renderApp } from "./helpers";

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
  document.documentElement.removeAttribute("dir");
  document.documentElement.lang = "en";
});

const keys = Object.keys(en) as Key[];
const placeholders = (s: string) => [...new Set(s.match(/\{\w+\}/g) ?? [])].sort();
const html = () => document.documentElement;
const urdu = () => click("اردو");
const URDU = /[\u0600-\u06FF]/;
/** Text that may stay in Latin script in Urdu: names, IDs, dates, file names. */
const KEPT =
  /StitchSure|Master Mahad|Areeba|Shayan|English|Language|SS-0\d\d|reference\.jpg|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}(, \d\d:\d\d)?|\b(AR|MM|SH)\b/g;
const leftoverEnglish = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const found: string[] = [];
  while (walker.nextNode()) {
    const rest = walker.currentNode.textContent!.replace(KEPT, "");
    if (/[A-Za-z]{3,}/.test(rest)) found.push(walker.currentNode.textContent!);
  }
  return found;
};

describe("Dictionary", () => {
  it("has every English key in Urdu", () => {
    expect(keys.filter((k) => !ur[k]?.trim())).toEqual([]);
    expect(Object.keys(ur).sort()).toEqual(keys.slice().sort());
  });

  it("keeps the same placeholders in both languages", () => {
    const wrong = keys.filter((k) => `${placeholders(en[k])}` !== `${placeholders(ur[k])}`);
    expect(wrong).toEqual([]);
  });

  it("writes Urdu in Urdu script", () => {
    const sameOnPurpose: string[] = [
      "lang.label", "arrow", "event.pair", "event.partStyle", "event.quote", "event.styleNote",
      "event.plain", "event.review.text", "event.approved.text", "notice.why",
    ];
    expect(keys.filter((k) => !sameOnPurpose.includes(k) && !URDU.test(dictionaries.ur[k]))).toEqual([]);
  });

  it("translates a request's history and errors without changing the English record", () => {
    const sent = reduce(initialWorkflow, { type: "request", part: "Sleeve", style: "Bell sleeves", note: "", reference: false, at: "Oct 26, 2026, 16:04" });
    const e = sent.events.at(-1)!;
    expect(e.title).toBe("Sleeve change requested");
    expect(t(e.msg!.title.key, e.msg!.title.vars, "ur")).toContain("آستین");
    const bad = reduce(initialWorkflow, { type: "start" });
    expect(t(bad.errorMsg!.key, bad.errorMsg!.vars, "ur")).toMatch(URDU);
  });
});

describe("Language switch", () => {
  it("changes direction and language, and remembers the choice after a reload", () => {
    renderApp();
    expect(html().dir).toBe("ltr");
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
    urdu();
    expect(html()).toHaveAttribute("lang", "ur");
    expect(html()).toHaveAttribute("dir", "rtl");
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe("ur");
    cleanup();
    renderApp();
    expect(html()).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("button", { name: "اردو" })).toHaveAttribute("aria-pressed", "true");
    click("English");
    expect(html()).toHaveAttribute("lang", "en");
    expect(html()).toHaveAttribute("dir", "ltr");
  });

  it("still works when storage is blocked", () => {
    const blocked = () => { throw new Error("blocked"); };
    const get = vi.spyOn(window.localStorage, "getItem").mockImplementation(blocked);
    const set = vi.spyOn(window.localStorage, "setItem").mockImplementation(blocked);
    renderApp();
    urdu();
    expect(html()).toHaveAttribute("dir", "rtl");
    get.mockRestore();
    set.mockRestore();
  });

  it("shows the three customer choices in Urdu", () => {
    renderApp();
    urdu();
    expect(screen.getByRole("heading", { name: "آپ کیا کرنا چاہیں گے؟" })).toBeInTheDocument();
    for (const name of ["میرا ڈیزائن بدلیں", "میرا آرڈر دیکھیں", "ماسٹر مہاد کو پیغام بھیجیں"])
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
  });
});

describe("All three roles in Urdu", () => {
  it("leaves no English interface text through the whole journey", async () => {
    renderApp();
    urdu();
    const clean = () => expect(leftoverEnglish()).toEqual([]);
    const role = (name: "گاہک" | "درزی" | "کاریگر") => pick(name);
    const fill = (id: string, value: string) => {
      const el = document.getElementById(id)!;
      expect(el).not.toBeNull();
      fireEvent.change(el, { target: { value } });
    };
    clean();
    click("میرا آرڈر دیکھیں");
    clean();
    click("انتخاب پر واپس");
    click("ماسٹر مہاد کو پیغام بھیجیں");
    clean();
    click("انتخاب پر واپس");
    click("میرا ڈیزائن بدلیں");
    clean();
    pick(/^آستین/);
    click("آگے");
    clean();
    pick(/^بیل آستین/);
    click("آگے");
    clean();
    click("درخواست بھیجیں");
    await flushSend();
    clean();
    role("درزی");
    clean();
    click("ناپ");
    click("گاہک اور آرڈر کی تفصیل");
    click("آرڈر کا ریکارڈ");
    clean();
    pick("نہیں بن سکتا");
    fill("review-reason", "کپڑا کٹ چکا ہے");
    fill("review-alt", "Cuff Trim");
    fill("review-cost", "مفت");
    fill("review-date", "وہی");
    clean_except_typed();
    click("گاہک کو جواب بھیجیں");
    role("گاہک");
    clean();
    click(/منظور کریں$/);
    clean();
    role("کاریگر");
    clean();
    click("سلائی شروع کریں");
    expect(screen.getByRole("alert")).toHaveTextContent(URDU);
    clean();
    fireEvent.click(screen.getByRole("checkbox"));
    click("سلائی شروع کریں");
    click("سلائی مکمل کریں");
    clean();

    // "Cuff Trim" typed by the tailor is a known style, so it is shown in Urdu too.
    function clean_except_typed() {
      expect(leftoverEnglish().filter((s) => s !== "Cuff Trim")).toEqual([]);
    }
  });
});
