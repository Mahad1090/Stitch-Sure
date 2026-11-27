/** One group per defect confirmed in the D5 evaluation. IDs are the D5 register IDs. */
import { screen } from "@testing-library/react";
import {
  DESCRIBED,
  initialWorkflow,
  requestedLabel,
  workflowReducer as reduce,
} from "@/lib/workflow";
import {
  backFromApproved,
  click,
  flushSend,
  openForm,
  pick,
  renderApp,
  reviewImpossible,
  reviewPossible,
  sendRequest,
  startStitching,
  type,
  viewAs,
} from "./helpers";

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

const undoButton = () => screen.queryByRole("button", { name: "Undo approval" });

describe("M-03: undo stays available", () => {
  it("is still on the order home after leaving the approval card, until stitching starts", async () => {
    renderApp();
    await sendRequest({ style: /^Cuff Trim/ });
    reviewPossible();
    viewAs("Customer");
    click("Approve Cuff Trim");
    backFromApproved();
    expect(undoButton()).toBeInTheDocument();
    startStitching();
    viewAs("Customer");
    expect(undoButton()).not.toBeInTheDocument();
  });

  it("really reverses the approval from the order home", async () => {
    renderApp();
    await sendRequest({ style: /^Cuff Trim/ });
    reviewPossible();
    viewAs("Customer");
    click("Approve Cuff Trim");
    backFromApproved();
    click("Undo approval");
    expect(screen.getByRole("button", { name: "Approve Cuff Trim" })).toBeInTheDocument();
  });
});

describe("M-02: the customer's own words reach the worker", () => {
  const NOTE = "Three quarter sleeve with a small slit";
  const at = "Oct 26, 2026, 16:04";
  const described = () =>
    reduce(initialWorkflow, {
      type: "request",
      part: "Sleeve",
      style: DESCRIBED,
      note: `  ${NOTE}  `,
      reference: false,
      at,
    });
  const reviewed = () =>
    reduce(described(), {
      type: "review",
      outcome: "Possible",
      reason: "",
      alternative: "",
      cost: "No extra cost",
      date: "Delivery unchanged",
      at,
    });

  it("uses the note as the design name in the reducer: approval, history and declined list", () => {
    expect(requestedLabel(described().request!)).toBe(NOTE);
    const approved = reduce(reviewed(), { type: "approve", at });
    expect(approved.sleeve).toBe(NOTE);
    expect(JSON.stringify([approved.events, approved.message])).not.toContain(DESCRIBED);
    const rejected = reduce(reviewed(), { type: "reject", at });
    expect(rejected.declined[0]).toContain(NOTE);
    expect(JSON.stringify([rejected.events, rejected.declined])).not.toContain(DESCRIBED);
    const cancelled = reduce(described(), { type: "cancel", at });
    expect(JSON.stringify(cancelled.events)).not.toContain(DESCRIBED);
  });

  it("never shows the placeholder on screen, from request to the worker's instructions", async () => {
    renderApp();
    const noPlaceholder = () => expect(document.body.textContent).not.toContain(DESCRIBED);
    await sendRequest({ style: /described|my own words|my note/i, note: NOTE });
    noPlaceholder();
    reviewPossible();
    noPlaceholder();
    viewAs("Customer");
    noPlaceholder();
    click(`Approve ${NOTE}`);
    noPlaceholder();
    viewAs("Worker");
    expect(screen.getAllByText(NOTE, { exact: false }).length).toBeGreaterThan(0);
    noPlaceholder();
  });
});

describe("S-01 / S-05 / A-18: the tailor's review starts blank", () => {
  const send = () => screen.getByRole("button", { name: /^Send (review|question)/ });

  it("selects nothing, hides the fields and disables Send", async () => {
    renderApp();
    await sendRequest();
    viewAs("Tailor");
    for (const name of ["Can be made", "Cannot be made", /Need info|Ask a question/])
      expect(screen.getByRole("radio", { name })).not.toBeChecked();
    expect(send()).toBeDisabled();
    expect(screen.queryByLabelText("Cost effect")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Reason|Note for/)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/flared wrist, so|How long should the sleeves/);
  });

  it("shows empty fields after a choice and clears them when the choice changes", async () => {
    renderApp();
    await sendRequest();
    viewAs("Tailor");
    pick("Cannot be made");
    expect(send()).toBeEnabled();
    for (const l of [/Reason it cannot be made/, /Offer this instead/, "Cost effect"])
      expect(screen.getByLabelText(l)).toHaveValue("");
    type(/Reason it cannot be made/, "stale reason");
    type("Cost effect", "Rs 200");
    pick("Can be made");
    expect(screen.getByLabelText(/Note for/)).toHaveValue("");
    expect(screen.getByLabelText("Cost effect")).toHaveValue("");
  });

  it("is blank again after the customer replies to a question", async () => {
    renderApp();
    await sendRequest();
    viewAs("Tailor");
    pick(/Need info|Ask a question/);
    type(/Your question/, "How wide at the wrist?");
    click("Send question");
    viewAs("Customer");
    type(/Your answer/, "Nine inches");
    click("Send reply");
    viewAs("Tailor");
    for (const r of [/Need info|Ask a question/, "Cannot be made"])
      expect(screen.getByRole("radio", { name: r })).not.toBeChecked();
    expect(send()).toBeDisabled();
    pick(/Need info|Ask a question/);
    expect(screen.getByLabelText(/Your question/)).toHaveValue("");
  });
});

describe("S-04: focus follows the screen", () => {
  const focused = () => document.activeElement as HTMLElement;
  const expectHeadingFocus = () => {
    expect(focused()).toHaveAttribute("data-focus-target");
    expect(focused().tagName).toMatch(/^H[1-3]$/);
  };

  it("does not steal focus on first load", () => {
    renderApp();
    expect(document.activeElement).toBe(document.body);
  });

  it("moves to the new heading after each screen change", async () => {
    renderApp();
    openForm();
    expectHeadingFocus();
    pick(/^Sleeve/);
    click("Next");
    expectHeadingFocus();
    pick(/^Cuff Trim/);
    click("Next");
    expectHeadingFocus();
    click("Send request");
    await flushSend();
    expectHeadingFocus();
    reviewPossible();
    expectHeadingFocus();
    viewAs("Customer");
    click("Approve Cuff Trim");
    expectHeadingFocus();
  });

  it("leaves focus on the error when one is shown", () => {
    renderApp();
    viewAs("Worker");
    click(/start stitching/i);
    expect(focused()).toHaveAttribute("role", "alert");
  });

  it("puts a safe disclosure before Cancel request on the waiting screen", async () => {
    renderApp();
    await sendRequest();
    const heading = focused();
    const next = [...document.querySelectorAll<HTMLElement>("button, a[href], input, textarea")]
      .filter((el) => el.tabIndex >= 0 && !el.hasAttribute("disabled"))
      .find((el) => heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(next).toHaveTextContent("What happens next");
    expect(next).not.toHaveTextContent("Cancel");
  });
});

describe("S-08: garment hotspots are pointer shortcuts only", () => {
  it("keeps the hotspots out of the Tab order", () => {
    renderApp();
    openForm();
    const spots = document.querySelectorAll<HTMLButtonElement>(".ss-hotspot");
    expect(spots).toHaveLength(5);
    spots.forEach((s) => expect(s.tabIndex).toBe(-1));
  });
});

describe("M-26: phone order is banner, task, progress, facts", () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
  });
  const follows = (a: Element, b: Element) =>
    Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

  const check = async (phone: boolean) => {
    window.matchMedia = ((q: string) => ({
      ...original(q),
      matches: phone && q.includes("700px"),
    })) as typeof window.matchMedia;
    renderApp();
    await sendRequest();
    const q = (s: string) => document.querySelector(s)!;
    return {
      hero: q(".ss-hero"),
      task: q("[data-focus-target]").closest("section")!,
      rail: q(".ss-rail"),
    };
  };

  it("puts the task card right after the banner at 700px or narrower", async () => {
    const { hero, task, rail } = await check(true);
    expect(follows(hero, task) && follows(task, rail)).toBe(true);
  });

  it("keeps progress above the task on wider screens", async () => {
    const { rail, task } = await check(false);
    expect(follows(rail, task)).toBe(true);
  });
});
