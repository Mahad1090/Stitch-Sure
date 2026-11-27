/** Team request: more choices under "Change my design", including "Other". */
import { fireEvent, screen } from "@testing-library/react";
import { PARTS, STYLE_OPTIONS } from "@/lib/sample";
import { designOf, initialWorkflow, workflowReducer as reduce, type Part } from "@/lib/workflow";
import { dictionaries } from "@/lib/i18n";
import { click, flushSend, openForm, pick, renderApp, type, viewAs } from "./helpers";

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());
const at = "Mar 15, 2030, 09:30";
const approve = (part: Part, style: string, note = "") => {
  const sent = reduce(initialWorkflow, { type: "request", part, style, note, reference: false, at });
  const ok = reduce(sent, { type: "review", outcome: "Possible", reason: "", alternative: "", cost: "None", date: "Same", at });
  return reduce(ok, { type: "approve", at });
};

describe("More design choices", () => {
  it("offers six parts, with words for every part and style in both languages", () => {
    expect(PARTS).toEqual(["Sleeve", "Neckline", "Length", "Pocket", "Trouser", "Other"]);
    for (const style of Object.values(STYLE_OPTIONS).flat())
      for (const lang of ["en", "ur"] as const) {
        expect(dictionaries[lang]).toHaveProperty([`term.${style}`]);
        expect(dictionaries[lang]).toHaveProperty([`style.hint.${style}`]);
      }
  });

  it("changes only the chosen part, and undo restores it", () => {
    const s = approve("Pocket", "Side pocket");
    expect(designOf(s, "Pocket")).toBe("Side pocket");
    expect([s.sleeve, s.neckline]).toEqual(["Straight sleeve", "Round neckline"]);
    expect(designOf(reduce(s, { type: "undo", at }), "Pocket")).toBe("No pocket");
  });

  it("takes an Other request from the customer to the worker in their words", async () => {
    renderApp();
    openForm();
    pick(/^Other/);
    click("Next");
    expect(screen.getByRole("heading", { name: "What do you want changed?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    type(/^Note/, "Add buttons on the front");
    click("Next");
    const summary = screen.getByText("You are asking for").parentElement!;
    expect(summary).toHaveTextContent("“Add buttons on the front”");
    // Plain words only: no "Nothing extra", arrow or earlier design.
    expect(summary.textContent).not.toMatch(/Nothing extra|→|Before/);
    expect(summary).toHaveTextContent("What you want");
    click("Send request");
    await flushSend();
    viewAs("Tailor");
    pick("Can be made");
    type("Cost effect", "None");
    type("Delivery effect", "Same");
    click("Send review to customer");
    viewAs("Customer");
    click("Approve Add buttons on the front");
    viewAs("Worker");
    expect(document.querySelector(".ss-job")).toHaveTextContent("Add buttons on the front");
  });

  it("can be chosen from the picture, for every part it draws", () => {
    renderApp();
    openForm();
    const spots = [...document.querySelectorAll<HTMLButtonElement>(".ss-hotspot")];
    expect(spots.map((s) => s.textContent)).toEqual(["Neckline", "Sleeve", "Pocket", "Length", "Trouser"]);
    for (const spot of spots) {
      expect(spot.tabIndex).toBe(-1);
      fireEvent.click(spot);
      expect(screen.getByRole("radio", { name: new RegExp(`^${spot.textContent}`) })).toBeChecked();
    }
  });

  it("changes the trousers in the agreed design and the drawing", () => {
    expect(designOf(initialWorkflow, "Trouser")).toBe("Straight trouser");
    const s = approve("Trouser", "Shalwar");
    expect(s.extras.Trouser).toBe("Shalwar");
    expect(designOf(reduce(s, { type: "undo", at }), "Trouser")).toBe("Straight trouser");
  });

  it("draws a different garment for a new style", () => {
    renderApp();
    const body = () => document.querySelector(".g-body")!.getAttribute("d");
    const before = body();
    openForm();
    pick(/^Length/);
    click("Next");
    pick(/^Long length/);
    click("Next");
    const rows = [...document.querySelectorAll(".ss-request dl > div")].map((row) => row.textContent);
    expect(rows).toEqual(["BeforeStandard length", "What you wantLong length"]);
    expect(before).toContain("320");
  });
});
