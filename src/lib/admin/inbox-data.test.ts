import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ENQUIRY_COLUMNS,
  deleteEnquiry,
  getEnquiry,
  listEnquiries,
  setEnquiryStatus,
} from "./inbox-data";

/* A hand-written fake Supabase client: every awaited query is recorded and
   answered by `respond`. Nothing here talks to a database. */

type Filter = [op: string, column: string, value: unknown];
type Call = {
  table: string;
  action: "select" | "update" | "delete";
  payload?: unknown;
  columns?: string;
  returning?: string;
  filters: Filter[];
  maybeSingle?: boolean;
};
type Resp = { data: unknown; error: unknown };

function fakeClient(respond: (call: Call) => Resp = () => ({ data: [{ id: "e1" }], error: null })) {
  const calls: Call[] = [];
  function from(table: string) {
    const call: Call = { table, action: "select", filters: [] };
    const b = {
      select(cols: string) {
        if (call.action === "select") call.columns = cols;
        else call.returning = cols;
        return b;
      },
      update(v: unknown) {
        call.action = "update";
        call.payload = v;
        return b;
      },
      delete() {
        call.action = "delete";
        return b;
      },
      eq: (c: string, v: unknown) => (call.filters.push(["eq", c, v]), b),
      order: (c: string, o: unknown) => (call.filters.push(["order", c, o]), b),
      maybeSingle() {
        call.maybeSingle = true;
        return b;
      },
      then(res: (r: Resp) => unknown, rej?: (e: unknown) => unknown) {
        calls.push(call);
        return Promise.resolve(respond(call)).then(res, rej);
      },
    };
    return b;
  }
  return { sb: { from } as unknown as SupabaseClient, calls };
}

describe("listEnquiries", () => {
  it("selects named columns, newest first, and returns the rows", async () => {
    const rows = [{ id: "e1" }];
    const { sb, calls } = fakeClient(() => ({ data: rows, error: null }));
    await expect(listEnquiries(sb)).resolves.toEqual(rows);
    expect(ENQUIRY_COLUMNS).not.toContain("*");
    expect(calls[0]).toMatchObject({
      table: "contact_messages",
      action: "select",
      columns: ENQUIRY_COLUMNS,
      filters: [["order", "created_at", { ascending: false }]],
    });
  });

  it("throws the error so the query shows it", async () => {
    const err = { message: "boom" };
    const { sb } = fakeClient(() => ({ data: null, error: err }));
    await expect(listEnquiries(sb)).rejects.toBe(err);
  });
});

describe("getEnquiry", () => {
  it("returns the row, or null when it is gone", async () => {
    const { sb, calls } = fakeClient(() => ({ data: { id: "e1" }, error: null }));
    await expect(getEnquiry(sb, "e1")).resolves.toEqual({ ok: true, row: { id: "e1" } });
    expect(calls[0]).toMatchObject({ maybeSingle: true, filters: [["eq", "id", "e1"]] });
    const gone = fakeClient(() => ({ data: null, error: null }));
    await expect(getEnquiry(gone.sb, "e1")).resolves.toEqual({ ok: true, row: null });
  });

  it("reports an error rather than throwing", async () => {
    const err = { message: "boom" };
    const { sb } = fakeClient(() => ({ data: null, error: err }));
    await expect(getEnquiry(sb, "e1")).resolves.toEqual({ ok: false, error: err });
  });
});

describe("setEnquiryStatus", () => {
  it("updates only when the row is still in the state the screen saw", async () => {
    const { sb, calls } = fakeClient();
    await expect(setEnquiryStatus(sb, "e1", "read", "archived")).resolves.toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      table: "contact_messages",
      action: "update",
      payload: { status: "archived" },
      returning: "id",
      filters: [
        ["eq", "id", "e1"],
        ["eq", "status", "read"],
      ],
    });
  });

  it("no rows back is a conflict", async () => {
    const { sb } = fakeClient(() => ({ data: [], error: null }));
    await expect(setEnquiryStatus(sb, "e1", "new", "read")).resolves.toEqual({
      ok: false,
      conflict: true,
    });
  });

  it("returns the error instead of throwing", async () => {
    const err = { code: "42501" };
    const { sb } = fakeClient(() => ({ data: null, error: err }));
    await expect(setEnquiryStatus(sb, "e1", "new", "archived")).resolves.toEqual({
      ok: false,
      error: err,
    });
  });

  it("refuses a move the inbox does not offer, without writing", async () => {
    const { sb, calls } = fakeClient();
    const result = await setEnquiryStatus(sb, "e1", "archived", "new");
    expect(result.ok).toBe(false);
    expect("error" in result).toBe(true);
    expect(calls).toHaveLength(0);
  });
});

describe("deleteEnquiry", () => {
  it("deletes only a message that is under Done", async () => {
    const { sb, calls } = fakeClient();
    await expect(deleteEnquiry(sb, "e1")).resolves.toEqual({ ok: true });
    expect(calls[0]).toMatchObject({
      table: "contact_messages",
      action: "delete",
      returning: "id",
      filters: [
        ["eq", "id", "e1"],
        ["eq", "status", "archived"],
      ],
    });
  });

  it("no rows back is a conflict; an error is returned", async () => {
    const none = fakeClient(() => ({ data: [], error: null }));
    await expect(deleteEnquiry(none.sb, "e1")).resolves.toEqual({ ok: false, conflict: true });
    const err = { message: "boom" };
    const bad = fakeClient(() => ({ data: null, error: err }));
    await expect(deleteEnquiry(bad.sb, "e1")).resolves.toEqual({ ok: false, error: err });
  });
});
