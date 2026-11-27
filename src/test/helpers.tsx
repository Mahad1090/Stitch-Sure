/** Renders the whole app and drives it the way a person would. Shared by the UI tests. */
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { Route } from "@/routes/index";

export function renderApp() {
  const App = Route.options.component as ComponentType;
  return render(<App />);
}

export const click = (name: string | RegExp) =>
  fireEvent.click(screen.getByRole("button", { name }));
export const pick = (name: string | RegExp) => fireEvent.click(screen.getByRole("radio", { name }));
export const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
export const viewAs = (role: "Customer" | "Tailor" | "Worker") => pick(role);

/** The send button has a short simulated delay. */
export async function flushSend() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(800);
  });
}

export const openForm = () => click("Request a change");

export async function sendRequest(
  o: { style?: RegExp; note?: string } = { style: /^Bell sleeves/ },
) {
  openForm();
  pick(/^Sleeve/);
  pick(o.style ?? /^Bell sleeves/);
  if (o.note) type(/Note/, o.note);
  click("Send request");
  await flushSend();
}

/** Tailor answers "Can be made". Used after the fabric stage is irrelevant (not bell sleeves). */
export function reviewPossible() {
  viewAs("Tailor");
  pick("Can be made");
  type("Cost effect", "No extra cost");
  type("Delivery effect", "Delivery unchanged");
  click("Send review to customer");
}

export function reviewImpossible() {
  viewAs("Tailor");
  pick("Cannot be made");
  type(/Reason it cannot be made/, "Fabric is already cut");
  type(/Offer this instead/, "Cuff Trim");
  type("Cost effect", "No extra cost");
  type("Delivery effect", "Delivery unchanged");
  click("Send review to customer");
}

export const backFromApproved = () => click("Back to my orders");

export function startStitching() {
  viewAs("Worker");
  fireEvent.click(screen.getByRole("checkbox", { name: /I have read the current version/ }));
  click(/start stitching/i);
}
