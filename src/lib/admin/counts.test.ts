import { describe, it, expect } from "vitest";
import { countEmptyPhotoPositions, totalNeedingAttention } from "./counts";
import { PHOTO_SLOTS } from "@/lib/photo-slots";

const bare = PHOTO_SLOTS.filter((s) => !s.fallback).map((s) => s.key);

describe("countEmptyPhotoPositions", () => {
  it("counts every position with no upload and no shipped picture", () => {
    expect(countEmptyPhotoPositions([])).toBe(bare.length);
  });

  it("stops counting a position once a photo is uploaded for it", () => {
    expect(countEmptyPhotoPositions([bare[0], bare[1]])).toBe(bare.length - 2);
  });

  it("ignores uploads to positions that already had a picture, and unknown keys", () => {
    const withFallback = PHOTO_SLOTS.find((s) => s.fallback)!.key;
    expect(countEmptyPhotoPositions([withFallback, "no.such.slot"])).toBe(bare.length);
  });

  it("counts a key uploaded twice once", () => {
    expect(countEmptyPhotoPositions([bare[0], bare[0]])).toBe(bare.length - 1);
  });
});

describe("totalNeedingAttention", () => {
  it("adds the three counts", () => {
    expect(totalNeedingAttention({ storiesWaiting: 2, inboxNew: 3, photosEmpty: 4 })).toBe(9);
  });
  it("is zero when nothing waits", () => {
    expect(totalNeedingAttention({ storiesWaiting: 0, inboxNew: 0, photosEmpty: 0 })).toBe(0);
  });
});
