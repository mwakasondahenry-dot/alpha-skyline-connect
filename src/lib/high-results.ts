/**
 * Alpha High's NECTA results, as NECTA publishes them for examination
 * centre S2549 (ALPHA SECONDARY SCHOOL, Dar es Salaam).
 *
 * Every figure is copied from the linked NECTA page, nothing is rounded or
 * derived beyond simple counts, and each sitting carries its source so the
 * page can link to it. The shape is shared with Alpha Girls
 * (src/lib/girls-results.ts) so one chart draws both schools. Add a new
 * sitting here when NECTA publishes it; the test beside this file checks
 * the divisions add up to the candidates.
 *
 * The centre was matched to Alpha High on 2026-10-22 as the only
 * co-education "Alpha" centre in Dar es Salaam in NECTA's index (the others
 * are Alpha Girls, S5889, and Alpha Adventist, S5603). The site owner has
 * been asked to confirm the match.
 */
import type { Sitting } from "./girls-results";

export const CSEE_2025: Sitting = {
  exam: "CSEE",
  year: 2025,
  candidates: 92,
  passed: 92,
  divisions: { I: 60, II: 19, III: 12, IV: 1, "0": 0 },
  gpa: "1.9439",
  gpaGrade: "Grade B (Very Good)",
  source: "https://onlinesys.necta.go.tz/results/2025/csee/results/s2549.htm",
};

export const CSEE_2024: Sitting = {
  exam: "CSEE",
  year: 2024,
  candidates: 90,
  passed: 90,
  divisions: { I: 39, II: 35, III: 12, IV: 4, "0": 0 },
  gpa: "2.2157",
  gpaGrade: "Grade B (Very Good)",
  source: "https://onlinesys.necta.go.tz/results/2024/csee/results/s2549.htm",
};

export const ACSEE_2026: Sitting = {
  exam: "ACSEE",
  year: 2026,
  candidates: 188,
  passed: 188,
  divisions: { I: 85, II: 76, III: 27, IV: 0, "0": 0 },
  gpa: "2.5062",
  gpaGrade: "Grade C (Good)",
  source: "https://matokeo.necta.go.tz/results/2026/acsee/results/s2549.htm",
};

/** CSEE 2025 English Language, from the same NECTA page. */
export const CSEE_2025_ENGLISH = { gpa: "1.5761", grade: "Grade A (Excellent)", candidates: 92 };
