import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ALUMNI_INVITE_COLUMNS, ALUMNI_STORY_COLUMNS, loadAlumni } from "./alumni-data";

type Call = { table: string; steps: Array<[string, ...unknown[]]> };

function fakeClient(rows: Record<string, unknown[]>, error: unknown = null) {
  const calls: Call[] = [];
  const sb = {
    from(table: string) {
      const call: Call = { table, steps: [] };
      calls.push(call);
      const q = {
        select: (...a: unknown[]) => (call.steps.push(["select", ...a]), q),
        eq: (...a: unknown[]) => (call.steps.push(["eq", ...a]), q),
        not: (...a: unknown[]) => (call.steps.push(["not", ...a]), q),
        order: (...a: unknown[]) => (call.steps.push(["order", ...a]), q),
        then: (res: (v: unknown) => void) => res({ data: rows[table] ?? [], error }),
      };
      return q;
    },
  };
  return { sb: sb as unknown as SupabaseClient, calls };
}

describe("loadAlumni", () => {
  it("reads alumni invites and class-year stories with explicit columns, never *", async () => {
    const { sb, calls } = fakeClient({});
    await loadAlumni(sb);
    const inv = calls.find((c) => c.table === "testimonial_invites")!;
    const st = calls.find((c) => c.table === "testimonials")!;
    expect(inv.steps).toContainEqual(["select", ALUMNI_INVITE_COLUMNS]);
    expect(inv.steps).toContainEqual(["eq", "audience", "alumni"]);
    expect(st.steps).toContainEqual(["select", ALUMNI_STORY_COLUMNS]);
    expect(st.steps).toContainEqual(["not", "grad_year", "is", null]);
    expect(ALUMNI_STORY_COLUMNS.split(",")).toContain("answers");
    expect(ALUMNI_INVITE_COLUMNS).not.toContain("token");
    expect(`${ALUMNI_INVITE_COLUMNS},${ALUMNI_STORY_COLUMNS}`).not.toContain("*");
  });

  it("merges the two into people", async () => {
    const { sb } = fakeClient({
      testimonial_invites: [
        {
          id: "i1",
          full_name: "Asha",
          phone: "+255712345678",
          email: null,
          school_slug: "alpha-high",
          grad_year: 2019,
          status: "pending",
          created_at: "2026-01-01T00:00:00Z",
          submitted_at: null,
        },
      ],
    });
    const d = await loadAlumni(sb);
    expect(d.people.map((p) => p.key)).toEqual(["invite:i1"]);
    expect(d.invites).toHaveLength(1);
  });

  it("throws a read error so the screen can show it", async () => {
    const { sb } = fakeClient({}, { message: "boom" });
    await expect(loadAlumni(sb)).rejects.toEqual({ message: "boom" });
  });
});
