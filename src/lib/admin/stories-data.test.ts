import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/image-compress", () => ({
  makeSmallCopy: vi.fn(async () => new Blob(["small"], { type: "image/webp" })),
  compressImage: vi.fn(async () => ({
    blob: new Blob(["compressed"], { type: "image/webp" }),
    width: 10,
    height: 10,
    originalBytes: 100,
    bytes: 10,
    ext: "webp",
  })),
}));

import { compressImage, makeSmallCopy } from "@/lib/image-compress";
import {
  createStory,
  deleteStory,
  guardedMove,
  listStories,
  publishStory,
  removeStoryPhoto,
  replaceStoryPhoto,
  saveStoryEdit,
  setFeatured,
  signPendingPhotos,
  STORY_COLUMNS,
  swapFeaturedOrder,
  type AdminStory,
} from "./stories-data";

/* ---------- A hand-written fake Supabase client ----------
   Every awaited database query and every storage call is recorded, in the
   order it happens, and answered by `respond` (overridable per test). */

type Filter = [op: string, column: string, value: unknown];
type Call =
  | {
      kind: "db";
      table: string;
      action: "select" | "insert" | "update" | "delete";
      payload?: unknown;
      filters: Filter[];
      returning?: string;
      single?: boolean;
    }
  | { kind: "storage"; bucket: string; op: string; args: unknown[] };

type Resp = { data: unknown; error: unknown };

function defaultRespond(call: Call): Resp {
  if (call.kind === "db") {
    if (call.action === "insert") return { data: { id: "new-id" }, error: null };
    if (call.action === "select" && !call.returning) return { data: [], error: null };
    return { data: [{ id: "row" }], error: null };
  }
  if (call.op === "download") {
    return { data: new Blob(["original"], { type: "image/jpeg" }), error: null };
  }
  if (call.op === "createSignedUrls") {
    const paths = call.args[0] as string[];
    return {
      data: paths.map((p) => ({ path: p, signedUrl: `signed:${p}`, error: null })),
      error: null,
    };
  }
  return { data: {}, error: null };
}

function fakeClient(respond: (call: Call, fallback: Resp) => Resp = (_c, f) => f) {
  const calls: Call[] = [];
  const answer = (call: Call) => {
    calls.push(call);
    return respond(call, defaultRespond(call));
  };

  function query(table: string) {
    const call: Extract<Call, { kind: "db" }> = {
      kind: "db",
      table,
      action: "select",
      filters: [],
    };
    const b = {
      select(cols?: string) {
        if (call.action === "select" && call.returning === undefined && !call.payload) {
          call.payload = cols;
        } else {
          call.returning = cols;
        }
        return b;
      },
      insert(v: unknown) {
        call.action = "insert";
        call.payload = v;
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
      in: (c: string, v: unknown) => (call.filters.push(["in", c, v]), b),
      is: (c: string, v: unknown) => (call.filters.push(["is", c, v]), b),
      not: (c: string, op: string, v: unknown) => (call.filters.push(["not", c, [op, v]]), b),
      order: (c: string, o: unknown) => (call.filters.push(["order", c, o]), b),
      single() {
        call.single = true;
        return b;
      },
      then(res: (r: Resp) => unknown, rej?: (e: unknown) => unknown) {
        return Promise.resolve(answer(call)).then(res, rej);
      },
    };
    return b;
  }

  const storage = {
    from(bucket: string) {
      const op =
        (name: string) =>
        async (...args: unknown[]) =>
          answer({ kind: "storage", bucket, op: name, args });
      return {
        download: op("download"),
        upload: op("upload"),
        remove: op("remove"),
        createSignedUrls: op("createSignedUrls"),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://cdn.test/storage/v1/object/public/${bucket}/${path}` },
        }),
      };
    },
  };

  const sb = { from: query, storage } as unknown as SupabaseClient;
  return { sb, calls };
}

function story(over: Partial<AdminStory> = {}): AdminStory {
  return {
    id: "s1",
    status: "waiting",
    author_name: "Keith",
    relationship: "Engineer",
    company: "Vodacom",
    quote: "Alpha taught me to think.",
    grad_year: 2018,
    school_slug: "alpha-high",
    photo_url: null,
    pending_photo_path: "2026/abc.jpg",
    consent_at: "2026-10-01T10:00:00Z",
    consent_text: "I agree",
    answers: null,
    invite_id: null,
    featured: false,
    featured_order: null,
    decline_reason: null,
    created_at: "2026-10-01T10:00:00Z",
    decided_at: null,
    city_country: null,
    ...over,
  };
}

/** A compact trace of what happened, for order assertions. */
function trace(calls: Call[]) {
  return calls.map((c) =>
    c.kind === "db"
      ? `db:${c.action}:${c.table}`
      : `storage:${c.op}:${c.bucket}:${
          c.op === "remove" ? (c.args[0] as string[]).join(",") : String(c.args[0])
        }`,
  );
}

const dbCalls = (calls: Call[]) =>
  calls.filter((c): c is Extract<Call, { kind: "db" }> => c.kind === "db");

beforeEach(() => {
  vi.mocked(makeSmallCopy).mockClear();
  vi.mocked(compressImage).mockClear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("STORY_COLUMNS / listStories", () => {
  it("names columns explicitly", () => {
    expect(STORY_COLUMNS).not.toContain("*");
    expect(STORY_COLUMNS.split(",")).toContain("pending_photo_path");
    expect(STORY_COLUMNS.split(",")).toContain("status");
  });

  it("selects STORY_COLUMNS and returns rows", async () => {
    const { sb, calls } = fakeClient((c, f) =>
      c.kind === "db" ? { data: [story()], error: null } : f,
    );
    const rows = await listStories(sb);
    expect(rows).toHaveLength(1);
    const [q] = dbCalls(calls);
    expect(q.payload).toBe(STORY_COLUMNS);
  });

  it("throws on a load error", async () => {
    const { sb } = fakeClient(() => ({ data: null, error: { message: "boom" } }));
    await expect(listStories(sb)).rejects.toBeTruthy();
  });
});

describe("signPendingPhotos", () => {
  it("signs every path in one createSignedUrls call for an hour", async () => {
    const { sb, calls } = fakeClient();
    const out = await signPendingPhotos(sb, ["a.jpg", "b.jpg"]);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      kind: "storage",
      bucket: "alumni-pending",
      op: "createSignedUrls",
      args: [["a.jpg", "b.jpg"], 3600],
    });
    expect(out).toEqual({ "a.jpg": "signed:a.jpg", "b.jpg": "signed:b.jpg" });
  });

  it("makes no call for no paths", async () => {
    const { sb, calls } = fakeClient();
    expect(await signPendingPhotos(sb, [])).toEqual({});
    expect(calls).toHaveLength(0);
  });
});

describe("guardedMove", () => {
  it("returns a conflict when no row matched", async () => {
    const { sb } = fakeClient((c, f) => (c.kind === "db" ? { data: [], error: null } : f));
    expect(await guardedMove(sb, "s1", "live", "hidden")).toEqual({ ok: false, conflict: true });
  });

  it("returns ok with one row, guarded on the expected status", async () => {
    const { sb, calls } = fakeClient();
    expect(await guardedMove(sb, "s1", "live", "hidden")).toEqual({ ok: true });
    const [u] = dbCalls(calls);
    expect(u.action).toBe("update");
    expect(u.filters).toContainEqual(["eq", "id", "s1"]);
    expect(u.filters).toContainEqual(["eq", "status", "live"]);
    expect(u.returning).toBe("id");
    const payload = u.payload as Record<string, unknown>;
    expect(payload.status).toBe("hidden");
    expect(typeof payload.decided_at).toBe("string");
    expect(Number.isNaN(Date.parse(payload.decided_at as string))).toBe(false);
  });

  it("passes extra fields through", async () => {
    const { sb, calls } = fakeClient();
    await guardedMove(sb, "s1", "waiting", "declined", { decline_reason: "Off topic" });
    expect(dbCalls(calls)[0].payload).toMatchObject({
      status: "declined",
      decline_reason: "Off topic",
    });
  });

  it("returns the error when the update fails", async () => {
    const err = { message: "nope" };
    const { sb } = fakeClient(() => ({ data: null, error: err }));
    expect(await guardedMove(sb, "s1", "live", "hidden")).toEqual({ ok: false, error: err });
  });

  it("refuses Waiting → Live: publishStory is the only publish path", async () => {
    const { sb, calls } = fakeClient();
    const r = await guardedMove(sb, "s1", "waiting", "live");
    expect(r.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("moving to Live from Hidden also requires no pending photo", async () => {
    const { sb, calls } = fakeClient();
    await guardedMove(sb, "s1", "hidden", "live");
    expect(dbCalls(calls)[0].filters).toContainEqual(["is", "pending_photo_path", null]);
  });
});

describe("publishStory", () => {
  it("copies, makes the small copy, publishes, then removes the pending file — in that order", async () => {
    const { sb, calls } = fakeClient();
    const r = await publishStory(sb, story());
    expect(r).toEqual({ ok: true });
    expect(trace(calls)).toEqual([
      "storage:download:alumni-pending:2026/abc.jpg",
      "storage:upload:media:testimonials/story-s1.jpg",
      "storage:upload:media:testimonials/small/story-s1.webp",
      "db:update:testimonials",
      "storage:remove:alumni-pending:2026/abc.jpg",
    ]);
    expect(makeSmallCopy).toHaveBeenCalledWith(expect.any(Blob), 320);

    const publicUpload = calls[1] as Extract<Call, { kind: "storage" }>;
    expect(publicUpload.args[2]).toMatchObject({ upsert: true });

    const [u] = dbCalls(calls);
    expect(u.filters).toContainEqual(["eq", "id", "s1"]);
    expect(u.filters).toContainEqual(["eq", "status", "waiting"]);
    expect(u.payload).toMatchObject({
      status: "live",
      photo_url: "https://cdn.test/storage/v1/object/public/media/testimonials/story-s1.jpg",
      pending_photo_path: null,
    });
  });

  it("does not publish or remove the pending file when the public upload fails", async () => {
    const { sb, calls } = fakeClient((c, f) =>
      c.kind === "storage" && c.op === "upload" ? { data: null, error: { message: "full" } } : f,
    );
    const r = await publishStory(sb, story());
    expect(r.ok).toBe(false);
    expect(r).toHaveProperty("error");
    expect(dbCalls(calls)).toHaveLength(0);
    expect(calls.some((c) => c.kind === "storage" && c.op === "remove")).toBe(false);
  });

  it("does not publish when the pending photo cannot be read", async () => {
    const { sb, calls } = fakeClient((c, f) =>
      c.kind === "storage" && c.op === "download"
        ? { data: null, error: { message: "Object not found" } }
        : f,
    );
    const r = await publishStory(sb, story());
    expect(r.ok).toBe(false);
    expect(dbCalls(calls)).toHaveLength(0);
  });

  it("still publishes when the small copy cannot be made", async () => {
    vi.mocked(makeSmallCopy).mockRejectedValueOnce(new Error("canvas"));
    const { sb, calls } = fakeClient();
    expect(await publishStory(sb, story())).toEqual({ ok: true });
    expect(trace(calls)).toEqual([
      "storage:download:alumni-pending:2026/abc.jpg",
      "storage:upload:media:testimonials/story-s1.jpg",
      "db:update:testimonials",
      "storage:remove:alumni-pending:2026/abc.jpg",
    ]);
  });

  it("still publishes when the small copy upload fails", async () => {
    const { sb } = fakeClient((c, f) =>
      c.kind === "storage" && c.op === "upload" && String(c.args[0]).includes("/small/")
        ? { data: null, error: { message: "small failed" } }
        : f,
    );
    expect(await publishStory(sb, story())).toEqual({ ok: true });
  });

  it("refuses without a consent record and makes no calls", async () => {
    const { sb, calls } = fakeClient();
    const r = await publishStory(sb, story({ consent_at: null }));
    expect(r.ok).toBe(false);
    expect(r).toHaveProperty("error");
    expect(calls).toHaveLength(0);
  });

  it("on a conflict returns conflict and keeps the pending file", async () => {
    const { sb, calls } = fakeClient((c, f) => (c.kind === "db" ? { data: [], error: null } : f));
    expect(await publishStory(sb, story())).toEqual({ ok: false, conflict: true });
    expect(calls.some((c) => c.kind === "storage" && c.op === "remove")).toBe(false);
  });

  it("on an update error keeps the pending file", async () => {
    const { sb, calls } = fakeClient((c, f) =>
      c.kind === "db" ? { data: null, error: { message: "jwt expired" } } : f,
    );
    const r = await publishStory(sb, story());
    expect(r.ok).toBe(false);
    expect(calls.some((c) => c.kind === "storage" && c.op === "remove")).toBe(false);
  });

  it("succeeds even if removing the pending file fails", async () => {
    const { sb } = fakeClient((c, f) =>
      c.kind === "storage" && c.op === "remove" ? { data: null, error: { message: "x" } } : f,
    );
    expect(await publishStory(sb, story())).toEqual({ ok: true });
  });

  it("without a pending photo only moves the status and never touches photo_url", async () => {
    const { sb, calls } = fakeClient();
    const r = await publishStory(
      sb,
      story({ pending_photo_path: null, photo_url: "https://cdn.test/old.jpg" }),
    );
    expect(r).toEqual({ ok: true });
    expect(calls.every((c) => c.kind === "db")).toBe(true);
    const [u] = dbCalls(calls);
    expect(u.filters).toContainEqual(["eq", "status", "waiting"]);
    expect(u.payload).not.toHaveProperty("photo_url");
  });
});

describe("saveStoryEdit", () => {
  const edit = {
    author_name: "Keith",
    relationship: "Engineer",
    company: null,
    quote: "Words",
    grad_year: null,
    school_slug: null,
  };

  it("sends grad_year null, never 0", async () => {
    const { sb, calls } = fakeClient();
    expect(await saveStoryEdit(sb, "s1", edit, "waiting")).toEqual({ ok: true });
    const [u] = dbCalls(calls);
    expect((u.payload as Record<string, unknown>).grad_year).toBeNull();
    expect(u.filters).toContainEqual(["eq", "status", "waiting"]);
    expect(u.payload).not.toHaveProperty("status");
  });

  it("turns a 0 year into null", async () => {
    const { sb, calls } = fakeClient();
    await saveStoryEdit(sb, "s1", { ...edit, grad_year: 0 }, "live");
    expect((dbCalls(calls)[0].payload as Record<string, unknown>).grad_year).toBeNull();
  });

  it("returns a conflict when the story moved", async () => {
    const { sb } = fakeClient((c, f) => (c.kind === "db" ? { data: [], error: null } : f));
    expect(await saveStoryEdit(sb, "s1", edit, "waiting")).toEqual({
      ok: false,
      conflict: true,
    });
  });
});

describe("replaceStoryPhoto", () => {
  const file = new File(["x"], "me.jpg", { type: "image/jpeg" });

  it("for a waiting story writes the private pending photo only", async () => {
    const { sb, calls } = fakeClient();
    const r = await replaceStoryPhoto(sb, story({ pending_photo_path: "2026/abc.jpg" }), file);
    expect(r).toEqual({ ok: true });
    expect(compressImage).toHaveBeenCalledWith(file);
    const storage = calls.filter((c) => c.kind === "storage");
    expect(storage.every((c) => c.bucket === "alumni-pending")).toBe(true);
    const [u] = dbCalls(calls);
    expect(u.filters).toContainEqual(["eq", "status", "waiting"]);
    expect(u.payload).not.toHaveProperty("photo_url");
    // The old file is removed only after the row points at the new one.
    expect(trace(calls).at(-1)).toBe("storage:remove:alumni-pending:2026/abc.jpg");
  });

  it("for a live story uploads to public media with a small copy and sets photo_url", async () => {
    const { sb, calls } = fakeClient();
    const r = await replaceStoryPhoto(
      sb,
      story({ status: "live", pending_photo_path: null, photo_url: null }),
      file,
    );
    expect(r).toEqual({ ok: true });
    expect(trace(calls)).toEqual([
      "storage:upload:media:testimonials/story-s1.webp",
      "storage:upload:media:testimonials/small/story-s1.webp",
      "db:update:testimonials",
    ]);
    const [u] = dbCalls(calls);
    expect(u.filters).toContainEqual(["eq", "status", "live"]);
    expect(u.payload).toMatchObject({
      photo_url: "https://cdn.test/storage/v1/object/public/media/testimonials/story-s1.webp",
    });
  });

  it("stops before any upload when compression refuses the file", async () => {
    vi.mocked(compressImage).mockRejectedValueOnce(new Error("too big"));
    const { sb, calls } = fakeClient();
    const r = await replaceStoryPhoto(sb, story({ status: "live" }), file);
    expect(r.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });
});

describe("removeStoryPhoto", () => {
  it("for a waiting story clears the pending path, then removes the private file", async () => {
    const { sb, calls } = fakeClient();
    expect(await removeStoryPhoto(sb, story())).toEqual({ ok: true });
    expect(trace(calls)).toEqual([
      "db:update:testimonials",
      "storage:remove:alumni-pending:2026/abc.jpg",
    ]);
    expect(dbCalls(calls)[0].payload).toEqual({ pending_photo_path: null });
  });

  it("for a live story clears photo_url, then removes its own public files", async () => {
    const { sb, calls } = fakeClient();
    const s = story({
      status: "live",
      pending_photo_path: null,
      photo_url: "https://cdn.test/storage/v1/object/public/media/testimonials/story-s1.jpg",
    });
    expect(await removeStoryPhoto(sb, s)).toEqual({ ok: true });
    expect(trace(calls)).toEqual([
      "db:update:testimonials",
      "storage:remove:media:testimonials/story-s1.jpg,testimonials/small/story-s1.webp",
    ]);
  });

  it("never deletes a shared file it does not own", async () => {
    const { sb, calls } = fakeClient();
    const s = story({
      status: "live",
      pending_photo_path: null,
      photo_url: "https://cdn.test/storage/v1/object/public/media/staff/team.jpg",
    });
    await removeStoryPhoto(sb, s);
    expect(calls.filter((c) => c.kind === "storage")).toHaveLength(0);
  });

  it("removes nothing on a conflict", async () => {
    const { sb, calls } = fakeClient((c, f) => (c.kind === "db" ? { data: [], error: null } : f));
    expect(await removeStoryPhoto(sb, story())).toEqual({ ok: false, conflict: true });
    expect(calls.filter((c) => c.kind === "storage")).toHaveLength(0);
  });
});

describe("createStory", () => {
  it("inserts as hidden and unpublished with a consent record", async () => {
    const { sb, calls } = fakeClient();
    const r = await createStory(
      sb,
      {
        author_name: "Amina",
        relationship: "Parent",
        company: null,
        quote: "Kind teachers.",
        grad_year: null,
        school_slug: null,
      },
      { text: "This person agreed to have their words on the website" },
    );
    expect(r).toEqual({ ok: true, id: "new-id" });
    const [i] = dbCalls(calls);
    expect(i.action).toBe("insert");
    expect(i.payload).toMatchObject({
      status: "hidden",
      published: false,
      consent_text: "This person agreed to have their words on the website",
      grad_year: null,
    });
    expect(typeof (i.payload as Record<string, unknown>).consent_at).toBe("string");
  });

  it("refuses without consent text", async () => {
    const { sb, calls } = fakeClient();
    const r = await createStory(
      sb,
      {
        author_name: "A",
        relationship: null,
        company: null,
        quote: "Q",
        grad_year: null,
        school_slug: null,
      },
      { text: "  " },
    );
    expect(r.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });
});

describe("deleteStory", () => {
  it("refuses a live story and makes no calls", async () => {
    const { sb, calls } = fakeClient();
    const r = await deleteStory(sb, story({ status: "live" }));
    expect(r.ok).toBe(false);
    expect(r).toHaveProperty("error");
    expect(calls).toHaveLength(0);
  });

  it("refuses a waiting story", async () => {
    const { sb, calls } = fakeClient();
    expect((await deleteStory(sb, story({ status: "waiting" }))).ok).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("deletes guarded on hidden|declined, then removes every photo file", async () => {
    const { sb, calls } = fakeClient();
    const s = story({
      status: "declined",
      photo_url: "https://cdn.test/storage/v1/object/public/media/testimonials/story-s1.jpg",
    });
    expect(await deleteStory(sb, s)).toEqual({ ok: true });
    const [d] = dbCalls(calls);
    expect(d.action).toBe("delete");
    expect(d.filters).toContainEqual(["eq", "id", "s1"]);
    expect(d.filters).toContainEqual(["in", "status", ["hidden", "declined"]]);
    expect(trace(calls)[0]).toBe("db:delete:testimonials");
    expect(trace(calls).slice(1).sort()).toEqual(
      [
        "storage:remove:alumni-pending:2026/abc.jpg",
        "storage:remove:media:testimonials/story-s1.jpg,testimonials/small/story-s1.webp",
      ].sort(),
    );
  });

  it("removes no files when the row was not deleted", async () => {
    const { sb, calls } = fakeClient((c, f) => (c.kind === "db" ? { data: [], error: null } : f));
    expect(await deleteStory(sb, story({ status: "hidden" }))).toEqual({
      ok: false,
      conflict: true,
    });
    expect(calls.filter((c) => c.kind === "storage")).toHaveLength(0);
  });
});

describe("featured", () => {
  it("features a live story with an order", async () => {
    const { sb, calls } = fakeClient();
    expect(await setFeatured(sb, "s1", true, 3)).toEqual({ ok: true });
    const [u] = dbCalls(calls);
    expect(u.payload).toEqual({ featured: true, featured_order: 3 });
    expect(u.filters).toContainEqual(["eq", "status", "live"]);
  });

  it("unfeaturing clears the order", async () => {
    const { sb, calls } = fakeClient();
    await setFeatured(sb, "s1", false, 3);
    expect(dbCalls(calls)[0].payload).toEqual({ featured: false, featured_order: null });
  });

  it("swaps two orders, each guarded on its current order", async () => {
    const { sb, calls } = fakeClient();
    expect(await swapFeaturedOrder(sb, { id: "a", order: 1 }, { id: "b", order: 2 })).toEqual({
      ok: true,
    });
    const [ua, ub] = dbCalls(calls);
    expect(ua.payload).toEqual({ featured_order: 2 });
    expect(ua.filters).toContainEqual(["eq", "featured_order", 1]);
    expect(ub.payload).toEqual({ featured_order: 1 });
    expect(ub.filters).toContainEqual(["eq", "featured_order", 2]);
  });

  it("puts the first back when the second has moved", async () => {
    let n = 0;
    const { sb, calls } = fakeClient((c, f) => {
      if (c.kind !== "db") return f;
      n += 1;
      return n === 2 ? { data: [], error: null } : f;
    });
    expect(await swapFeaturedOrder(sb, { id: "a", order: 1 }, { id: "b", order: 2 })).toEqual({
      ok: false,
      conflict: true,
    });
    const db = dbCalls(calls);
    expect(db).toHaveLength(3);
    expect(db[2].payload).toEqual({ featured_order: 1 });
    expect(db[2].filters).toContainEqual(["eq", "id", "a"]);
  });
});
