import { beforeEach, describe, expect, it, vi } from "vitest";
import { STALE_SECONDS, cached, clearMemoryCache } from "./edge-cache";

describe("cached", () => {
  beforeEach(() => clearMemoryCache());

  it("loads once and serves the stored value within the TTL", async () => {
    const load = vi.fn().mockResolvedValue({ n: 1 });
    expect(await cached("k", load)).toEqual({ n: 1 });
    expect(await cached("k", load)).toEqual({ n: 1 });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("past the TTL, serves the old value at once and refreshes for the next visitor", async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await cached("t", load, 1)).toBe(1);
    vi.advanceTimersByTime(1500);
    expect(await cached("t", load, 1)).toBe(1); // stale, served without waiting
    expect(load).toHaveBeenCalledTimes(2); // the refresh was started
    await vi.runAllTimersAsync();
    expect(await cached("t", load, 1)).toBe(2); // and the next visitor gets it
    expect(load).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("starts one background refresh per key, not one per visitor", async () => {
    vi.useFakeTimers();
    let release!: (v: number) => void;
    const load = vi
      .fn()
      .mockResolvedValueOnce(1)
      .mockImplementationOnce(() => new Promise<number>((r) => (release = r)));
    await cached("d", load, 1);
    vi.advanceTimersByTime(1500);
    expect(await cached("d", load, 1)).toBe(1);
    expect(await cached("d", load, 1)).toBe(1);
    expect(await cached("d", load, 1)).toBe(1);
    expect(load).toHaveBeenCalledTimes(2);
    release(2);
    await vi.runAllTimersAsync();
    expect(await cached("d", load, 1)).toBe(2);
    vi.useRealTimers();
  });

  it("waits for a fresh read once the value has expired entirely", async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await cached("x1", load, 1)).toBe(1);
    vi.advanceTimersByTime((1 + STALE_SECONDS) * 1000 + 500);
    expect(await cached("x1", load, 1)).toBe(2);
    vi.useRealTimers();
  });

  it("never caches a failure, and serves the last good value while failing", async () => {
    vi.useFakeTimers();
    const load = vi
      .fn()
      .mockResolvedValueOnce("good")
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce("fresh");
    expect(await cached("f", load, 1)).toBe("good");
    vi.advanceTimersByTime((1 + STALE_SECONDS) * 1000 + 500);
    expect(await cached("f", load, 1)).toBe("good"); // failed load, old value served
    expect(await cached("f", load, 1)).toBe("fresh"); // failure was not cached
    vi.useRealTimers();
  });

  it("remembers a fallback for a failing read, briefly", async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockRejectedValue(new Error("no table"));
    expect(await cached("e", load, 300, () => [])).toEqual([]);
    expect(await cached("e", load, 300, () => [])).toEqual([]);
    expect(load).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(61_000);
    await cached("e", load, 300, () => []);
    expect(load).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("throws when there is nothing to fall back on", async () => {
    await expect(cached("x", () => Promise.reject(new Error("down")))).rejects.toThrow("down");
  });

  it("does not keep a value the caller marks as not for storing", async () => {
    const load = vi.fn().mockResolvedValue(null);
    const opts = { store: (v: unknown) => v !== null };
    expect(await cached("miss", load, 300, undefined, opts)).toBeNull();
    expect(await cached("miss", load, 300, undefined, opts)).toBeNull();
    expect(load).toHaveBeenCalledTimes(2); // nothing was remembered
  });

  it("drops a held value once a refresh returns one not for storing", async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValueOnce({ id: 1 }).mockResolvedValue(null);
    const opts = { store: (v: unknown) => v !== null };
    expect(await cached("gone", load, 1, undefined, opts)).toEqual({ id: 1 });
    vi.advanceTimersByTime(1500);
    expect(await cached("gone", load, 1, undefined, opts)).toEqual({ id: 1 }); // stale
    await vi.runAllTimersAsync();
    expect(await cached("gone", load, 1, undefined, opts)).toBeNull(); // evicted, read again
    vi.useRealTimers();
  });
});
