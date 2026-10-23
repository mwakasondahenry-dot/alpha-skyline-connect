import { describe, expect, it } from "vitest";
import { STATUS_LABEL, UNDO, actionsFor, needsConsentRecord, transition } from "./story-status";

describe("story states", () => {
  it("offers the right actions per status", () => {
    expect(actionsFor("waiting")).toEqual(["publish", "decline"]);
    expect(actionsFor("live")).toEqual(["hide"]);
    expect(actionsFor("hidden")).toEqual(["show", "delete"]);
    expect(actionsFor("declined")).toEqual(["restore", "delete"]);
  });
  it("labels statuses", () => {
    expect(STATUS_LABEL).toEqual({
      waiting: "Waiting",
      live: "Live",
      hidden: "Hidden",
      declined: "Declined",
    });
  });
  it("transitions", () => {
    expect(transition("publish")).toEqual({ from: "waiting", to: "live" });
    expect(transition("decline")).toEqual({ from: "waiting", to: "declined" });
    expect(transition("restore")).toEqual({ from: "declined", to: "waiting" });
    expect(transition("hide")).toEqual({ from: "live", to: "hidden" });
    expect(transition("show")).toEqual({ from: "hidden", to: "live" });
  });
  it("records consent only on publish", () => {
    expect(needsConsentRecord("publish")).toBe(true);
    expect(needsConsentRecord("show")).toBe(false);
  });
  it("undo map", () => {
    expect(UNDO).toEqual({
      publish: { from: "live", to: "waiting" },
      decline: { from: "declined", to: "waiting" },
      hide: { from: "hidden", to: "live" },
      show: { from: "live", to: "hidden" },
      restore: { from: "waiting", to: "declined" },
    });
  });
});
