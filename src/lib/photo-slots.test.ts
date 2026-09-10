import { describe, it, expect } from "vitest";
import { PHOTO_SLOTS, slotDef, slotsBySection, slotPhoto } from "./photo-slots";

describe("registry integrity", () => {
  it("declares 39 slots", () => {
    expect(PHOTO_SLOTS).toHaveLength(39);
  });

  it("has no duplicate keys", () => {
    const keys = PHOTO_SLOTS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("prefixes every key with its own school", () => {
    for (const s of PHOTO_SLOTS) {
      expect(s.key.startsWith(`${s.school}.`)).toBe(true);
    }
  });

  it("resolves every declared fallback to a real bundled asset", () => {
    for (const s of PHOTO_SLOTS) {
      if (!s.fallback) continue;
      expect(typeof s.fallback).toBe("string");
      expect(s.fallback.length).toBeGreaterThan(0);
    }
  });

  it("leaves exactly the 13 deliberate slots without a fallback", () => {
    const bare = PHOTO_SLOTS.filter((s) => !s.fallback)
      .map((s) => s.key)
      .sort();
    expect(bare).toEqual([
      "alpha-girls.facilities.boarding",
      "alpha-girls.facilities.library",
      "alpha-girls.facilities.science-labs",
      "alpha-girls.facilities.sports-field",
      "alpha-high.facilities.boarding",
      "alpha-high.facilities.library",
      "alpha-high.facilities.science-labs",
      "alpha-high.facilities.sports-field",
      "alpha-high.sport.athletics",
      "alpha-high.sport.basketball",
      "alpha-high.sport.football",
      "alpha-high.sport.netball",
      "alpha-high.sport.volleyball",
    ]);
  });
});

describe("slotsBySection", () => {
  it("groups a school's slots and excludes other schools", () => {
    const groups = slotsBySection("alpha-girls");
    const all = groups.flatMap((g) => g.slots);
    expect(all.every((s) => s.school === "alpha-girls")).toBe(true);
    expect(all).toHaveLength(5);
    expect(groups.map((g) => g.section)).toEqual(["Campus & facilities", "Students"]);
  });

  it("covers all 39 slots across the three schools", () => {
    const total = (["nursery-primary", "alpha-high", "alpha-girls"] as const)
      .flatMap((s) => slotsBySection(s))
      .flatMap((g) => g.slots).length;
    expect(total).toBe(39);
  });
});

describe("slotPhoto", () => {
  const key = "nursery-primary.gallery.dance";

  it("prefers the uploaded row", () => {
    const got = slotPhoto(
      { [key]: { image_url: "https://cdn/x.webp", alt_text: "Pupils dancing", credit: null } },
      key,
    );
    expect(got).toEqual({ src: "https://cdn/x.webp", alt: "Pupils dancing" });
  });

  it("falls back to the bundled asset when nothing is uploaded", () => {
    const got = slotPhoto({}, key);
    expect(got).not.toBeNull();
    expect(got!.src).toBe(slotDef(key)!.fallback);
  });

  it("returns null for a slot with no upload and no fallback", () => {
    expect(slotPhoto({}, "alpha-high.facilities.library")).toBeNull();
  });

  it("returns null for an unknown key rather than throwing", () => {
    expect(slotPhoto({}, "nope.not.real")).toBeNull();
  });

  it("still resolves a fallback-less slot once a photo is uploaded", () => {
    const k = "alpha-high.sport.football";
    const got = slotPhoto(
      { [k]: { image_url: "https://cdn/f.webp", alt_text: "The first XI", credit: null } },
      k,
    );
    expect(got).toEqual({ src: "https://cdn/f.webp", alt: "The first XI" });
  });
});
