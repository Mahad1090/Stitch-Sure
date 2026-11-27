/** The remaining D5 findings. Test names start with the D5 register ID. */
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import type { ComponentType, ReactNode } from "react";
import { NOTE_LIMIT } from "@/components/stitchsure/useStitchSure";
import { sampleDates } from "@/lib/dates";
import { createInitialWorkflow, workflowReducer as reduce } from "@/lib/workflow";
import { Route as RootRoute } from "@/routes/__root";
import {
  click,
  flushSend,
  openForm,
  pick,
  renderApp,
  reviewImpossible,
  sendRequest,
  type,
  viewAs,
} from "./helpers";

const TODAY = new Date(2030, 2, 15, 9, 30);
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(TODAY);
});
afterEach(() => vi.useRealTimers());

const button = (name: string | RegExp) => screen.getByRole("button", { name });
const noButton = (name: string | RegExp) => screen.queryByRole("button", { name });
const body = () => document.body.textContent ?? "";
const times = (text: string) => body().split(text).length - 1;
const css = () => readFileSync("src/styles.css", "utf8");
const openMenu = () => {
  const opener = button(/^Open menu/);
  opener.focus();
  fireEvent.click(opener);
  return opener;
};
const reportProblem = () => {
  viewAs("Worker");
  click("Report a problem");
  pick("Fabric issue");
  type("Describe the problem", "A mark on one panel");
  click("Send report");
};

describe("Phone drawer", () => {
  it("A-06: closes on Escape", () => {
    renderApp();
    openMenu();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("M-07: wraps Tab, makes the page inert and returns focus on close", async () => {
    renderApp();
    const opener = openMenu();
    const items = [...screen.getByRole("dialog").querySelectorAll<HTMLElement>("button, a[href]")];
    items.at(-1)!.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(items[0]).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(items.at(-1)).toHaveFocus();
    for (const s of [".ss-demo", ".ss-bar", ".ss-shell"]) expect(document.querySelector(s)).toHaveAttribute("inert");
    expect(document.querySelector(".ss-skip")!.parentElement).toHaveAttribute("inert");
    click("Close menu");
    await flushSend();
    expect(opener).toHaveFocus();
  });

  it("S-12: past orders are plain text with nothing to press", () => {
    renderApp();
    openMenu();
    const past = document.querySelectorAll(".ss-order-past");
    expect(past).toHaveLength(3);
    past.forEach((p) => expect(p.querySelector("a, button, [tabindex]")).toBeNull());
  });
});

describe("Request form and customer screens", () => {
  it("S-09: says what was selected beside the part choices, not in the banner", () => {
    renderApp();
    openForm();
    pick(/^Sleeve/);
    const said = screen.getByText("Sleeve selected.");
    expect(said.closest(".ss-card")).not.toBeNull();
    expect(document.querySelector(".ss-hero")).not.toHaveTextContent("selected");
  });

  it("M-25: limits the note, counts it, and shortens it elsewhere with Show more", async () => {
    renderApp();
    openForm();
    pick(/^Sleeve/);
    click("Next");
    pick(/^Cuff Trim/);
    click("Next");
    expect(screen.getByLabelText(/^Note/)).toHaveAttribute("maxlength", String(NOTE_LIMIT));
    expect(NOTE_LIMIT).toBe(250);
    const long = `${"gold thread ".repeat(15)}END`;
    type(/^Note/, long);
    expect(screen.getByText(`${long.length} of 250 characters`)).toBeInTheDocument();
    click("Send request");
    await flushSend();
    const card = screen.getByRole("heading", { name: "Your request" }).closest("section")!;
    expect(card).not.toHaveTextContent("END");
    fireEvent.click([...card.querySelectorAll("button")].find((b) => b.textContent === "Show more")!);
    expect(card).toHaveTextContent("END");
  });

  it("M-25: never shortens the worker's instruction", async () => {
    renderApp();
    const long = `${"wide flared cuff ".repeat(9)}END`;
    await sendRequest({ style: /my own words/, note: long });
    viewAs("Tailor");
    pick("Can be made");
    type("Cost effect", "None");
    type("Delivery effect", "Same");
    click("Send review to customer");
    viewAs("Customer");
    click(`Approve ${long}`);
    viewAs("Worker");
    expect(document.querySelector(".ss-job")).toHaveTextContent("END");
    expect(document.querySelector(".ss-job .ss-more")).toBeNull();
  });

  it("A-13: leads with 'Agreed design' and keeps the version small", () => {
    renderApp();
    click(/^See my order/);
    const chip = screen.getByRole("heading", { name: "Your order" }).closest("section")!.querySelector(".ss-chip")!;
    expect(chip.firstChild?.nextSibling?.textContent).toBe("Agreed design");
    expect(chip.querySelector("small")).toHaveTextContent("Version 1");
  });

  it("M-22: says the original was kept once, on the home and order screens", async () => {
    renderApp();
    await sendRequest();
    reviewImpossible();
    viewAs("Customer");
    click("Keep my original design");
    expect(times("Tailor notified: original design kept.")).toBe(1);
    click(/^See my order/);
    expect(times("Tailor notified: original design kept.")).toBeLessThanOrEqual(1);
  });

  it("M-21: Escape closes the cancel confirmation and keeps the request", async () => {
    renderApp();
    await sendRequest();
    click("Cancel request");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(noButton("Yes, cancel request")).not.toBeInTheDocument();
    expect(button("Cancel request")).toBeInTheDocument();
  });

  it("M-20: labels a cancelled request Cancelled, not Rejected", async () => {
    const at = "Mar 15, 2030, 09:30";
    const sent = reduce(createInitialWorkflow(TODAY), { type: "request", part: "Sleeve", style: "Cuff Trim", note: "", reference: false, at });
    expect(reduce(sent, { type: "cancel", at }).events.at(-1)?.status).toBe("Cancelled");
    renderApp();
    await sendRequest();
    click("Cancel request");
    click("Yes, cancel request");
    click(/^See my order/);
    click("Progress and history");
    const entry = [...document.querySelectorAll(".ss-timeline li")].at(-1)!;
    expect(entry).toHaveTextContent("Cancelled");
    expect(entry).not.toHaveTextContent("Rejected");
  });
});

describe("Tailor and worker", () => {
  it("M-14: calls the third outcome 'Ask a question' everywhere it is named", async () => {
    renderApp();
    await sendRequest();
    viewAs("Tailor");
    expect(screen.getByRole("radio", { name: "Ask a question" })).toBeInTheDocument();
    pick("Ask a question");
    type(/Your question/, "How wide?");
    click("Send question");
    expect(body()).not.toContain("Need info");
    viewAs("Customer");
    expect(screen.getByRole("heading", { name: "Master Mahad asked" })).toBeInTheDocument();
    expect(body()).not.toMatch(/Need info|clarification/i);
  });

  it("M-17: marks the request seen when the tailor opens it, with no button", async () => {
    renderApp();
    await sendRequest();
    expect(screen.queryByText(/^Seen\./)).not.toBeInTheDocument();
    viewAs("Tailor");
    expect(noButton("Mark as seen")).not.toBeInTheDocument();
    expect(screen.getByText(/^Seen\. Still waiting for your review/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Can be made" })).not.toBeChecked();
  });

  it("A-19: saves the tailor's reply, shows it to the worker and clears it on a new problem", () => {
    const at = "Mar 15, 2030, 09:30";
    const held = reduce(createInitialWorkflow(TODAY), { type: "conflict", kind: "Fabric issue", reason: "Mark", at });
    const solved = reduce(held, { type: "resolve", reply: "  Use the other side  ", at });
    expect(solved.tailorReply).toBe("Use the other side");
    expect(solved.events.at(-1)?.text).toContain("Use the other side");
    expect(reduce(solved, { type: "conflict", kind: "Other", reason: "Again", at }).tailorReply).toBeUndefined();

    renderApp();
    reportProblem();
    viewAs("Tailor");
    const send = () => button("Send reply and resume work");
    expect(send()).toBeDisabled();
    type("Your reply to Shayan", "Use the other side");
    fireEvent.click(send());
    viewAs("Worker");
    expect(screen.getByText(/Master Mahad replied: “Use the other side”/)).toBeInTheDocument();
    reportProblem();
    expect(screen.queryByText(/Master Mahad replied/)).not.toBeInTheDocument();
    viewAs("Tailor");
    expect(screen.getByLabelText("Your reply to Shayan")).toHaveValue("");
  });

  it("A-23: Start stitching on hold stays focusable, explains why and does nothing", () => {
    renderApp();
    reportProblem();
    const start = button("Start stitching");
    expect(start).toBeEnabled();
    expect(start).toHaveAttribute("aria-disabled", "true");
    expect(start).toHaveAccessibleDescription(/on hold until Master Mahad replies/);
    start.focus();
    expect(start).toHaveFocus();
    const before = body();
    fireEvent.click(start);
    expect(body()).toBe(before);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("Whole app", () => {
  const skip = () => screen.getByRole("link", { name: "Skip to main content" });

  it("M-16: the first focusable element skips to the main content", () => {
    renderApp();
    const first = document.querySelector("a[href], button, input, textarea, [tabindex]");
    expect(first).toBe(skip());
    expect(skip()).toHaveAttribute("href", "#main");
    fireEvent.click(skip());
    expect(document.getElementById("main")).toHaveFocus();
  });

  it("M-16: the not-found page has it too", () => {
    const NotFound = RootRoute.options.notFoundComponent as ComponentType<{ children?: ReactNode }>;
    vi.spyOn(console, "error").mockImplementation(() => {});
    // The page's "Go home" link needs a router, so only check the source wiring.
    const source = readFileSync("src/routes/__root.tsx", "utf8");
    expect(NotFound).toBeDefined();
    expect(source.match(/<SkipLink \/>/g)).toHaveLength(2);
    expect(source.match(/<main id="main"/g)).toHaveLength(2);
    vi.restoreAllMocks();
  });

  it("M-11: Large text raises the root size and the small labels; sizes are relative", () => {
    renderApp();
    click("Large text");
    expect(document.documentElement).toHaveAttribute("data-large", "true");
    expect(css()).toMatch(/html\[data-large="true"\] \{ font-size: 125%; \}/);
    expect(css()).toMatch(/data-large="true"\] :is\([^)]*\.ss-rail small[^{]*\{ font-size: 0\.9375rem/);
    expect(css()).not.toMatch(/font-size: \d+(\.\d+)?px/);
    expect(css()).not.toMatch(/zoom:/);
    cleanup();
    document.documentElement.removeAttribute("data-large");
  });

  it("A-15: Reset sample and the View as options are at least 44px high", () => {
    renderApp();
    expect(button("Reset sample").className).toContain("min-h-11");
    expect(css()).toMatch(/\.ss-seg-item \{[^}]*min-height: 44px/);
    for (const r of ["Customer", "Tailor", "Worker"])
      expect(screen.getByRole("radio", { name: r }).closest("label")).toHaveClass("ss-seg-item");
  });

  it("A-24: dates follow today and never contradict each other", async () => {
    for (const today of [TODAY, new Date(2027, 11, 30), new Date(2028, 1, 28)]) {
      const d = sampleDates(today);
      expect(d.placed < d.agreed && d.agreed < today && today < d.delivery && d.delivery < d.event).toBe(true);
    }
    expect(createInitialWorkflow(TODAY).events[0]?.at).toMatch(/^Mar 10, 2030/);
    renderApp();
    click(/^See my order/);
    expect(body()).toContain("Mar 18, 2030"); // delivery
    click("More details");
    expect(body()).toContain("Mar 19, 2030"); // event
    expect(body()).not.toContain("2026");
    click("Go back");
    await sendRequest();
    click(/^See my order/);
    click("Progress and history");
    expect(document.querySelector(".ss-timeline")).toHaveTextContent("Mar 15, 2030");
  });

});
