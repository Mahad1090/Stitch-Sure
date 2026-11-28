/** Defects found in the team's own D6 testing (not D5 findings). */
import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { click, pick, renderApp, sendRequest, type, viewAs } from "./helpers";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/** Bell sleeves are refused and the customer approves the offered Cuff Trim. */
async function approveOffer() {
  renderApp();
  await sendRequest({ style: /^Bell sleeves/, note: "Flared at the wrist" });
  viewAs("Tailor");
  pick("Cannot be made");
  type(/^Reason/, "Fabric is cut");
  type(/^Offer/, "Cuff Trim");
  type("Cost effect", "No extra cost");
  type("Delivery effect", "Unchanged");
  click("Send review to customer");
  viewAs("Customer");
  click("Approve Cuff Trim");
}

describe("D6 self-testing fixes", () => {
  it("lets the tailor refuse without offering another design", async () => {
    renderApp();
    await sendRequest();
    viewAs("Tailor");
    pick("Cannot be made");
    type(/^Reason/, "Fabric is cut");
    expect(screen.queryByLabelText("Cost effect")).toBeNull();
    click("Send review to customer");
    viewAs("Customer");
    expect(screen.queryByRole("button", { name: /^Approve/ })).toBeNull();
    click("Keep my original design");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("never gives the worker or the order screen the refused design's note", async () => {
    await approveOffer();
    viewAs("Worker");
    expect(screen.queryByText(/Flared at the wrist/)).toBeNull();
    viewAs("Customer");
    click("Back to choices");
    click(/^See my order/);
    expect(screen.queryByText(/Flared at the wrist/)).toBeNull();
  });

  it("labels the refused request as not made, not approved", async () => {
    await approveOffer();
    viewAs("Tailor");
    const card = screen.getByRole("heading", { name: /wants/ }).closest("section")!;
    expect(within(card).getByText("Cannot be made")).toBeTruthy();
    expect(within(card).queryByText("Approved")).toBeNull();
  });

  it("tells the customer on the approval card when work is on hold", async () => {
    await approveOffer();
    viewAs("Worker");
    click("Report a problem");
    pick("Fabric issue");
    type(/^Describe/, "Mark on a panel");
    click("Send report");
    viewAs("Customer");
    expect(screen.getByText(/on hold until Master Mahad replies/)).toBeTruthy();
  });

  it("clears an error when the view changes or the report form opens or closes", async () => {
    await approveOffer();
    viewAs("Worker");
    click("Start stitching");
    expect(screen.getByRole("alert")).toBeTruthy();
    viewAs("Customer");
    expect(screen.queryByRole("alert")).toBeNull();
    viewAs("Worker");
    click("Start stitching");
    click("Report a problem");
    expect(screen.queryByRole("alert")).toBeNull();
    click("Send report");
    expect(screen.getByRole("alert")).toBeTruthy();
    click("Cancel report");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
