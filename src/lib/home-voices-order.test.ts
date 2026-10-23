import { describe, expect, it } from "vitest";
import { orderForHome } from "./home-voices-order";

const item = (
  id: string,
  created_at: string,
  featured?: boolean,
  featured_order?: number | null,
) => ({
  id,
  created_at,
  featured,
  featured_order,
});

describe("orderForHome", () => {
  it("puts featured first by featured_order, then the rest newest first", () => {
    const out = orderForHome([
      item("d1", "2026-01-01T00:00:00Z", false, null),
      item("d3", "2026-03-01T00:00:00Z", false, null),
      item("f2", "2026-01-15T00:00:00Z", true, 2),
      item("d2", "2026-02-01T00:00:00Z", false, null),
      item("f1", "2026-01-20T00:00:00Z", true, 1),
    ]);
    expect(out.map((i) => i.id)).toEqual(["f1", "f2", "d3", "d2", "d1"]);
  });

  it("puts featured items without a number after numbered ones, newest first", () => {
    const out = orderForHome([
      item("fn-old", "2026-01-01T00:00:00Z", true, null),
      item("fn-new", "2026-02-01T00:00:00Z", true, null),
      item("f1", "2025-01-01T00:00:00Z", true, 1),
    ]);
    expect(out.map((i) => i.id)).toEqual(["f1", "fn-new", "fn-old"]);
  });

  it("treats missing featured fields as unfeatured and does not mutate input", () => {
    const input = [item("a", "2026-01-01T00:00:00Z"), item("b", "2026-02-01T00:00:00Z")];
    const copy = [...input];
    expect(orderForHome(input).map((i) => i.id)).toEqual(["b", "a"]);
    expect(input).toEqual(copy);
  });
});
