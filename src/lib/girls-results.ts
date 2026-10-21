/**
 * Alpha Girls' NECTA results, as NECTA publishes them for examination
 * centre S5889 (ALPHA GIRLS' SECONDARY SCHOOL, Dar es Salaam).
 *
 * Every figure is copied from the linked NECTA page, nothing is rounded or
 * derived beyond simple counts, and each sitting carries its source so the
 * page can link to it. Add a new sitting here when NECTA publishes it; the
 * test beside this file checks the divisions add up to the candidates.
 */

export type Division = "I" | "II" | "III" | "IV" | "0";
export const DIVISIONS: ReadonlyArray<Division> = ["I", "II", "III", "IV", "0"];

export type Sitting = {
  /** "CSEE" is Form Four (O-Level); "ACSEE" is Form Six (A-Level). */
  exam: "CSEE" | "ACSEE";
  year: number;
  candidates: number;
  passed: number;
  divisions: Record<Division, number>;
  /** NECTA's centre GPA. Lower is better. */
  gpa: string;
  gpaGrade: string;
  source: string;
};

export const CSEE_2025: Sitting = {
  exam: "CSEE",
  year: 2025,
  candidates: 45,
  passed: 45,
  divisions: { I: 30, II: 11, III: 4, IV: 0, "0": 0 },
  gpa: "1.9311",
  gpaGrade: "Grade B (Very Good)",
  source: "https://onlinesys.necta.go.tz/results/2025/csee/results/s5889.htm",
};

export const CSEE_2024: Sitting = {
  exam: "CSEE",
  year: 2024,
  candidates: 45,
  passed: 45,
  divisions: { I: 25, II: 13, III: 6, IV: 1, "0": 0 },
  gpa: "2.1065",
  gpaGrade: "Grade B (Very Good)",
  source: "https://onlinesys.necta.go.tz/results/2024/csee/results/s5889.htm",
};

export const ACSEE_2026: Sitting = {
  exam: "ACSEE",
  year: 2026,
  candidates: 20,
  passed: 20,
  divisions: { I: 10, II: 10, III: 0, IV: 0, "0": 0 },
  gpa: "2.3333",
  gpaGrade: "Grade C (Good)",
  source: "https://matokeo.necta.go.tz/results/2026/acsee/results/s5889.htm",
};

/** CSEE 2025 English Language, from the same NECTA page. */
export const CSEE_2025_ENGLISH = { gpa: "1.5111", grade: "Grade A (Excellent)", candidates: 45 };

/** One entry per candidate, in division order: the unit chart's squares. */
export function squares(s: Sitting): Division[] {
  return DIVISIONS.flatMap((d) => Array.from({ length: s.divisions[d] }, () => d));
}
