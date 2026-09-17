import { describe, it, expect } from "vitest";
import { normalizeTzPhone } from "./phone";

const ok = (phone: string) => ({ ok: true, phone });

describe("normalizeTzPhone", () => {
  it.each([
    ["0712345678", "+255712345678"],
    ["0712 345 678", "+255712345678"],
    ["0712-345-678", "+255712345678"],
    ["(0712) 345678", "+255712345678"],
    ["712345678", "+255712345678"],
    ["255712345678", "+255712345678"],
    ["+255 712 345 678", "+255712345678"],
    ["0612345678", "+255612345678"],
  ])("accepts %s", (input, expected) => {
    expect(normalizeTzPhone(input)).toEqual(ok(expected));
  });

  it("accepts a foreign number written with +", () => {
    expect(normalizeTzPhone("+44 7700 900123")).toEqual(ok("+447700900123"));
  });

  it.each([
    ["", "Phone number is missing."],
    ["   ", "Phone number is missing."],
    ["07123abc78", "Phone number has letters or symbols in it."],
    ["071234", "Phone number should look like 0712 345 678."],
    ["0812345678", "Not a Tanzanian mobile number (it should start 06 or 07)."],
    ["+1234567", "Phone number should look like 0712 345 678."],
  ])("rejects %j", (input, reason) => {
    expect(normalizeTzPhone(input)).toEqual({ ok: false, reason });
  });
});
