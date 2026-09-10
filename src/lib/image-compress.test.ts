import { describe, it, expect } from "vitest";
import { fitWithin, formatBytes, MAX_EDGE, MAX_UPLOAD_BYTES } from "./image-compress";

describe("fitWithin", () => {
  it("leaves an image smaller than the cap alone", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("leaves an image exactly at the cap alone", () => {
    expect(fitWithin(1600, 900, 1600)).toEqual({ width: 1600, height: 900 });
  });

  it("scales a landscape photo by its width", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("scales a portrait photo by its height", () => {
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("never returns a zero dimension for an extreme panorama", () => {
    const got = fitWithin(8000, 30, 1600);
    expect(got.width).toBe(1600);
    expect(got.height).toBeGreaterThanOrEqual(1);
  });

  it("caps the long edge at 1600 by default", () => {
    expect(MAX_EDGE).toBe(1600);
  });

  it("holds the upload ceiling at 400KB", () => {
    expect(MAX_UPLOAD_BYTES).toBe(400 * 1024);
  });
});

describe("formatBytes", () => {
  it("reports KB under a megabyte", () => {
    expect(formatBytes(148 * 1024)).toBe("148 KB");
  });

  it("reports MB with one decimal above it", () => {
    expect(formatBytes(4.2 * 1024 * 1024)).toBe("4.2 MB");
  });
});
