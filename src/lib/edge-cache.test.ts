import { beforeEach, describe, expect, it, vi } from "vitest";
import { cached, clearMemoryCache } from "./edge-cache";

describe("cached", () => {
  beforeEach(() => clearMemoryCache());

  it("loads once and serves the stored value within the TTL", async () => {
    const load = vi.fn().mockResolvedValue({ n: 1 });
    expect(await cached("k", load)).toEqual({ n: 1 });
    expect(await cached("k", load)).toEqual({ n: 1 });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads after the TTL", async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await cached("t", load, 1)).toBe(1);
    vi.advanceTimersByTime(1500);
    expect(await cached("t", load, 1)).toBe(2);
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
    vi.advanceTimersByTime(1500);
    expect(await cached("f", load, 1)).toBe("good"); // failed load, stale served
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
});
