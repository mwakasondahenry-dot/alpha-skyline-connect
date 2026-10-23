import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDelayedFlag,
  createOutcomeStore,
  OUTCOME_CLEAR_MS,
  SPINNER_DELAY_MS,
} from "./timers";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("createDelayedFlag", () => {
  it("waits 300ms before turning on", () => {
    const seen: boolean[] = [];
    const flag = createDelayedFlag((v) => seen.push(v));
    flag.set(true);
    vi.advanceTimersByTime(SPINNER_DELAY_MS - 1);
    expect(seen).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(seen).toEqual([true]);
  });

  it("never turns on when the work ends inside the grace period", () => {
    const seen: boolean[] = [];
    const flag = createDelayedFlag((v) => seen.push(v));
    flag.set(true);
    vi.advanceTimersByTime(200);
    flag.set(false);
    vi.advanceTimersByTime(1000);
    expect(seen).toEqual([]);
  });

  it("turns off at once after it was on", () => {
    const seen: boolean[] = [];
    const flag = createDelayedFlag((v) => seen.push(v));
    flag.set(true);
    vi.advanceTimersByTime(SPINNER_DELAY_MS);
    flag.set(false);
    expect(seen).toEqual([true, false]);
  });

  it("does not restart the grace period on a repeated true", () => {
    const seen: boolean[] = [];
    const flag = createDelayedFlag((v) => seen.push(v));
    flag.set(true);
    vi.advanceTimersByTime(200);
    flag.set(true);
    vi.advanceTimersByTime(100);
    expect(seen).toEqual([true]);
  });

  it("dispose cancels a pending turn-on", () => {
    const seen: boolean[] = [];
    const flag = createDelayedFlag((v) => seen.push(v));
    flag.set(true);
    flag.dispose();
    vi.advanceTimersByTime(1000);
    expect(seen).toEqual([]);
  });
});

describe("createOutcomeStore", () => {
  it("shows an outcome and clears it after 8 seconds", () => {
    const store = createOutcomeStore();
    store.show({ text: "Published Keith's story." });
    expect(store.get()?.text).toBe("Published Keith's story.");
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS - 1);
    expect(store.get()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(store.get()).toBeNull();
  });

  it("a newer outcome replaces the old one and restarts the clock", () => {
    const store = createOutcomeStore();
    store.show({ text: "One" });
    vi.advanceTimersByTime(5000);
    store.show({ text: "Two" });
    const id = store.get()?.id;
    vi.advanceTimersByTime(5000);
    expect(store.get()?.text).toBe("Two");
    expect(store.get()?.id).toBe(id);
    vi.advanceTimersByTime(3000);
    expect(store.get()).toBeNull();
  });

  it("gives every outcome a new id so the same text announces again", () => {
    const store = createOutcomeStore();
    store.show({ text: "Saved." });
    const first = store.get()?.id;
    store.show({ text: "Saved." });
    expect(store.get()?.id).not.toBe(first);
  });

  it("notifies subscribers and stops after unsubscribe", () => {
    const store = createOutcomeStore();
    const fn = vi.fn();
    const off = store.subscribe(fn);
    store.show({ text: "A" });
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    store.clear();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("pause holds the outcome and resume gives it a fresh 8 seconds", () => {
    const store = createOutcomeStore();
    store.show({ text: "A" });
    vi.advanceTimersByTime(7000);
    store.pause("pointer");
    vi.advanceTimersByTime(60_000);
    expect(store.get()?.text).toBe("A");
    store.resume("pointer");
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS - 1);
    expect(store.get()?.text).toBe("A");
    vi.advanceTimersByTime(1);
    expect(store.get()).toBeNull();
  });

  it("pointer and focus hold the clock separately", () => {
    const store = createOutcomeStore();
    store.show({ text: "A" });
    store.pause("focus");
    store.pause("pointer");
    store.resume("pointer"); // pointer leaves, focus still inside
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS * 2);
    expect(store.get()?.text).toBe("A");
    store.resume("focus");
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS);
    expect(store.get()).toBeNull();
  });

  it("a new outcome is not held by a pause left over from the old one", () => {
    const store = createOutcomeStore();
    store.show({ text: "A" });
    store.pause("pointer");
    store.clear(); // dismissed while focused: no blur arrives
    store.show({ text: "B" });
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS);
    expect(store.get()).toBeNull();
  });

  it("runs Undo once, however often it is pressed", async () => {
    const store = createOutcomeStore();
    const undo = vi.fn(() => Promise.resolve());
    store.show({ text: "Declined.", undo });
    const a = store.undo();
    const b = store.undo();
    await Promise.all([a, b]);
    await store.undo();
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it("marks the outcome busy while Undo runs, then reports it undone", async () => {
    const store = createOutcomeStore();
    let finish: () => void = () => {};
    store.show({
      text: "Declined.",
      undo: () =>
        new Promise<void>((r) => {
          finish = r;
        }),
    });
    const p = store.undo();
    expect(store.get()?.undoing).toBe(true);
    // The clock does not run out from under a pending Undo.
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS * 2);
    expect(store.get()?.text).toBe("Declined.");
    finish();
    await p;
    expect(store.get()?.text).toBe("Undone.");
    expect(store.get()?.undo).toBeUndefined();
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS);
    expect(store.get()).toBeNull();
  });

  it("keeps an Undo failure on screen until dismissed", async () => {
    const store = createOutcomeStore({ describeError: () => "No internet connection." });
    store.show({ text: "Declined.", undo: () => Promise.reject(new Error("x")) });
    await store.undo();
    expect(store.get()?.text).toBe("No internet connection.");
    expect(store.get()?.tone).toBe("error");
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS * 3);
    expect(store.get()?.tone).toBe("error");
    store.clear();
    expect(store.get()).toBeNull();
  });

  it("does not let an old Undo overwrite a newer outcome", async () => {
    const store = createOutcomeStore();
    let finish: () => void = () => {};
    store.show({
      text: "Declined.",
      undo: () =>
        new Promise<void>((r) => {
          finish = r;
        }),
    });
    const p = store.undo();
    store.show({ text: "Published." });
    finish();
    await p;
    expect(store.get()?.text).toBe("Published.");
  });

  it("dispose stops the clock", () => {
    const store = createOutcomeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    store.show({ text: "A" });
    store.dispose();
    vi.advanceTimersByTime(OUTCOME_CLEAR_MS);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
