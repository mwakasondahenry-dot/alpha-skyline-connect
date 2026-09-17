import { describe, it, expect } from "vitest";
import { parsePastedList } from "./paste";

describe("parsePastedList", () => {
  it("reads name, phone and email in the shapes people paste", () => {
    const text = [
      "Asha Mushi, 0712 345 678",
      "",
      "John Kimaro 0754123456",
      "Neema Said, +255 713 000 111, neema@gmail.com",
      "neema.two@gmail.com; Neema Two; 0715 000 333",
      "Juma\t0714000222",
      "(0716) 000444 - Mary-Jane Paul",
    ].join("\n");

    const batch = parsePastedList(text, 2026);

    expect(batch.invalid).toEqual([]);
    expect(batch.valid.map((v) => [v.line, v.fullName, v.phone, v.email])).toEqual([
      [1, "Asha Mushi", "+255712345678", null],
      [3, "John Kimaro", "+255754123456", null],
      [4, "Neema Said", "+255713000111", "neema@gmail.com"],
      [5, "Neema Two", "+255715000333", "neema.two@gmail.com"],
      [6, "Juma", "+255714000222", null],
      [7, "Mary-Jane Paul", "+255716000444", null],
    ]);
  });

  it("reports a line with no phone number", () => {
    expect(parsePastedList("Just a name").invalid).toEqual([
      { line: 1, raw: "Just a name", reason: "Phone number is missing." },
    ]);
  });

  it("reports duplicates", () => {
    const batch = parsePastedList("Asha 0712345678\nAsha M +255712345678");
    expect(batch.valid).toHaveLength(1);
    expect(batch.duplicates).toEqual([
      { line: 2, raw: "Asha M +255712345678", reason: "Same phone number as line 1." },
    ]);
  });
});
