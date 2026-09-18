import { describe, it, expect } from "vitest";
import { sniffImage } from "./image-sniff";

function withHeader(header: number[]): Uint8Array {
  const out = new Uint8Array(16);
  out.set(header);
  return out;
}

describe("sniffImage", () => {
  it("recognises JPEG, PNG and WebP by their bytes", () => {
    expect(sniffImage(withHeader([0xff, 0xd8, 0xff]))?.ext).toBe("jpg");
    expect(sniffImage(withHeader([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.ext).toBe("png");
    expect(
      sniffImage(withHeader([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))?.mime,
    ).toBe("image/webp");
  });

  it("rejects anything else", () => {
    expect(sniffImage(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
    expect(sniffImage(new Uint8Array(0))).toBeNull();
  });
});
