import { describe, expect, it } from "vitest";
import { ACSEE_2026, CSEE_2024, CSEE_2025, DIVISIONS, squares } from "./girls-results";

describe("Alpha Girls NECTA results", () => {
  for (const s of [CSEE_2025, CSEE_2024, ACSEE_2026]) {
    it(`${s.exam} ${s.year}: divisions add up to the candidates`, () => {
      const total = DIVISIONS.reduce((n, d) => n + s.divisions[d], 0);
      expect(total).toBe(s.candidates);
      expect(s.passed).toBe(s.candidates - s.divisions["0"]);
      expect(s.source).toMatch(/^https:\/\/[a-z]+\.necta\.go\.tz\/.*s5889\.htm$/);
    });
  }

  it("lays out one square per candidate, best division first", () => {
    const sq = squares(CSEE_2025);
    expect(sq).toHaveLength(45);
    expect(sq.slice(0, 30).every((d) => d === "I")).toBe(true);
    expect(sq.at(-1)).toBe("III");
  });
});
