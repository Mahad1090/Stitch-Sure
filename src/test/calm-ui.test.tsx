/** Instructor feedback ("it looks very overwhelming"): one question, one decision, one job. */
import { fireEvent, screen } from "@testing-library/react";
import {
  click,
  flushSend,
  openForm,
  pick,
  renderApp,
  reviewImpossible,
  sendRequest,
  startStitching,
  type,
  viewAs,
} from "./helpers";

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

const button = (name: string | RegExp) => screen.getByRole("button", { name });
const noButton = (name: string | RegExp) => screen.queryByRole("button", { name });
const heading = (name: string | RegExp) => screen.queryByRole("heading", { name });
const timeline = () => screen.queryByRole("complementary", { name: "Version timeline" });
const clutter = () => [".ss-rail", ".ss-timeline"].map((s) => document.querySelector(s));

describe("Customer home", () => {
  it("asks one question with three choices and hides progress, facts and history", () => {
    renderApp();
    expect(heading("What would you like to do?")).toBeInTheDocument();
    expect(document.querySelectorAll(".ss-card")).toHaveLength(1);
    for (const n of [/^Change my design/, /^See my order/, /^Message Master Mahad/])
      expect(button(n)).toBeInTheDocument();
    expect(clutter()).toEqual([null, null]);
  });

  it("shows one quiet card under See my order, with progress and history on request", () => {
    renderApp();
    click(/^See my order/);
    expect(document.querySelectorAll(".ss-card")).toHaveLength(1);
    expect(clutter()).toEqual([null, null]);
    expect(timeline()).not.toBeInTheDocument();
    click("Progress and history");
    expect(document.querySelector(".ss-rail")).not.toBeNull();
    expect(document.querySelector(".ss-timeline")).not.toBeNull();
    click("Go back");
    expect(heading("What would you like to do?")).toBeInTheDocument();
  });

  it("keeps the waiting screen simple: progress and one card, each fact once", async () => {
    renderApp();
    await sendRequest();
    expect(document.querySelectorAll(".ss-card")).toHaveLength(1);
    expect(document.querySelector(".ss-rail")).not.toBeNull();
    expect(timeline()).not.toBeInTheDocument();
    expect(document.querySelector(".ss-hero")!.textContent).toBe("Waiting for Master Mahad");
    expect(screen.getAllByText(/Nothing changes until you both agree/)).toHaveLength(1);
  });

  it("keeps Send disabled until a message is typed", () => {
    renderApp();
    click(/^Message Master Mahad/);
    expect(button("Send")).toBeDisabled();
    type("Your message", "Please call me");
    click("Send");
    expect(screen.getByText(/Sent to Master Mahad/)).toBeInTheDocument();
  });

  it("disables Change my design with a plain reason once stitching starts", () => {
    renderApp();
    startStitching();
    viewAs("Customer");
    const change = button(/^Change my design/);
    expect(change).toHaveAttribute("aria-disabled", "true");
    expect(change).toHaveAccessibleName(/Stitching has started/);
    fireEvent.click(change);
    expect(heading("What would you like to do?")).toBeInTheDocument();
  });
});

describe("Back button beside the banner", () => {
  const back = () => screen.queryByRole("button", { name: "Go back" });
  const iconOnly = () => {
    expect(back()).toHaveClass("ss-back");
    expect(back()!.textContent).toBe("");
  };

  it("is hidden on the starting screen and returns from every opened screen", () => {
    renderApp();
    expect(back()).not.toBeInTheDocument();
    for (const open of [() => openForm(), () => click(/^See my order/), () => click(/^Message Master Mahad/)]) {
      open();
      iconOnly();
      click("Go back");
      expect(heading("What would you like to do?")).toBeInTheDocument();
    }
  });

  it("leaves a waiting request without changing it, and returns to it", async () => {
    renderApp();
    await sendRequest();
    iconOnly();
    click("Go back");
    expect(heading("What would you like to do?")).toBeInTheDocument();
    expect(button(/^Change my design/)).toHaveAccessibleName(/already waiting/);
    click(/^Your request/);
    expect(heading("Your request")).toBeInTheDocument();
  });

  it("is on the tailor and worker screens too", () => {
    renderApp();
    viewAs("Tailor");
    iconOnly();
    viewAs("Worker");
    click("Go back");
    expect(screen.getByRole("radio", { name: "Tailor" })).toBeChecked();
    viewAs("Worker");
    click("Report a problem");
    click("Go back");
    expect(button("Start stitching")).toBeInTheDocument();
  });
});

describe("Request form: one question per screen", () => {
  it("blocks Next until a choice is made and says why", () => {
    renderApp();
    openForm();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(button("Next")).toBeDisabled();
    expect(button("Next")).toHaveAccessibleDescription(/Choose a part/);
    expect(screen.queryByLabelText(/^Note/)).not.toBeInTheDocument();
    pick(/^Sleeve/);
    expect(button("Next")).toBeEnabled();
  });

  it("selects the part from the garment picture", () => {
    renderApp();
    openForm();
    fireEvent.click(document.querySelector(".ss-hotspot-neckline")!);
    expect(screen.getByRole("radio", { name: /^Neckline/ })).toBeChecked();
  });

  it("keeps choices when going back, and summarises before sending", async () => {
    renderApp();
    openForm();
    pick(/^Sleeve/);
    click("Next");
    pick(/^Cuff Trim/);
    click("Next");
    type(/^Note/, "gold thread");
    click("Back");
    expect(screen.getByRole("radio", { name: /^Cuff Trim/ })).toBeChecked();
    click("Back");
    expect(screen.getByRole("radio", { name: /^Sleeve/ })).toBeChecked();
    click("Next");
    click("Next");
    expect(screen.getByLabelText(/^Note/)).toHaveValue("gold thread");
    expect(screen.getByText("You are asking for").parentElement).toHaveTextContent("Cuff Trim");
    click("Send request");
    await flushSend();
    expect(heading("Your request")).toBeInTheDocument();
  });

  it("requires a note when the customer describes the style", () => {
    renderApp();
    openForm();
    pick(/^Sleeve/);
    click("Next");
    expect(screen.queryByLabelText(/^Note/)).not.toBeInTheDocument();
    pick(/my own words/);
    // The writing box is there at once, and Next waits for words.
    expect(button("Next")).toBeDisabled();
    expect(button("Next")).toHaveAccessibleDescription(/Write what you want/);
    type(/^Note/, "wide cuff");
    click("Next");
    expect(screen.getByLabelText(/^Note/)).toHaveValue("wide cuff");
    expect(button("Send request")).toBeEnabled();
  });
});

describe("Tailor: one decision at a time", () => {
  it("keeps customer details, measurements and history closed", async () => {
    renderApp();
    await sendRequest();
    viewAs("Tailor");
    for (const n of ["Customer and order details", "Measurements", "Order history"])
      expect(button(n)).toHaveAttribute("aria-expanded", "false");
    expect(timeline()).not.toBeInTheDocument();
    expect(document.querySelector(".ss-tiles")).toBeNull();
    click("Measurements");
    expect(screen.getByText("Relevant to this request")).toBeInTheDocument();
  });

  it("previews the message the customer will receive", async () => {
    renderApp();
    await sendRequest();
    viewAs("Tailor");
    pick("Cannot be made");
    type(/Offer this instead/, "Cuff Trim");
    expect(screen.getByText("Areeba will receive").parentElement).toHaveTextContent(/Cuff Trim/);
  });
});

describe("Worker: the job, nothing else", () => {
  it("shows one job card, with extras closed", () => {
    renderApp();
    viewAs("Worker");
    expect(document.querySelectorAll(".ss-card")).toHaveLength(1);
    expect(clutter()).toEqual([null, null]);
    expect(button("Start stitching")).toBeInTheDocument();
    expect(screen.queryByLabelText("Describe the problem")).not.toBeInTheDocument();
    click("Report a problem");
    expect(screen.getByLabelText("Describe the problem")).toBeInTheDocument();
  });

  it("announces a newer version and requires acknowledgement before starting", async () => {
    renderApp();
    await sendRequest();
    reviewImpossible();
    viewAs("Customer");
    click("Approve Cuff Trim");
    viewAs("Worker");
    expect(screen.getByText(/Updated: Version 2 replaced Version 1/)).toBeInTheDocument();
    click("Start stitching");
    expect(screen.getByRole("alert")).toHaveTextContent(/I have read the current version/);
    fireEvent.click(screen.getByRole("checkbox", { name: /I have read/ }));
    expect(screen.queryByText(/Updated: Version 2/)).not.toBeInTheDocument();
    click("Start stitching");
    click("Finish stitching");
    expect(screen.getByText(/Marked as finished\. Master Mahad/, { selector: ".ss-notice-ok span" })).toBeInTheDocument();
  });
});

describe("Orders drawer", () => {
  it("is closed by default, takes focus, closes on Escape and returns focus", async () => {
    renderApp();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const opener = button(/^Open menu/);
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(button("Close menu")).toHaveFocus();
    expect(document.querySelector("main")!.parentElement).toHaveAttribute("inert");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await flushSend();
    expect(opener).toHaveFocus();
    expect(noButton("Close menu")).not.toBeInTheDocument();
  });
});
