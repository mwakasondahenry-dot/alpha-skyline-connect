import { describe, expect, it } from "vitest";
import type { AdminStory } from "./stories-data";
import {
  EMPTY_STORY_FORM,
  STAFF_CONSENT_TEXT,
  barActions,
  cardLines,
  formToEdit,
  isFormDirty,
  isStoryTab,
  moveExtra,
  nextFeaturedOrder,
  refeatureOrder,
  undoMoveExtra,
  outcomeText,
  possessive,
  shownPhoto,
  storiesForTab,
  storySource,
  storyToForm,
  tabCounts,
  validateStoryForm,
} from "./stories-view";

function story(over: Partial<AdminStory> = {}): AdminStory {
  return {
    id: "s1",
    status: "waiting",
    author_name: "Keith Mrema",
    relationship: null,
    company: null,
    quote: "Alpha taught me to think.",
    grad_year: null,
    school_slug: "alpha-high",
    photo_url: null,
    pending_photo_path: null,
    consent_at: "2026-10-01T08:00:00Z",
    consent_text: "I agree",
    answers: null,
    invite_id: null,
    featured: false,
    featured_order: null,
    decline_reason: null,
    created_at: "2026-10-01T08:00:00Z",
    decided_at: null,
    city_country: null,
    ...over,
  };
}

describe("isStoryTab", () => {
  it("accepts the four states only", () => {
    for (const t of ["waiting", "live", "hidden", "declined"]) expect(isStoryTab(t)).toBe(true);
    expect(isStoryTab("published")).toBe(false);
    expect(isStoryTab(undefined)).toBe(false);
  });
});

describe("tabCounts", () => {
  it("counts each state", () => {
    const counts = tabCounts([
      story({ id: "a" }),
      story({ id: "b" }),
      story({ id: "c", status: "live" }),
      story({ id: "d", status: "declined" }),
    ]);
    expect(counts).toEqual({ waiting: 2, live: 1, hidden: 0, declined: 1 });
  });
});

describe("storiesForTab", () => {
  it("orders Waiting oldest first (a fair queue)", () => {
    const list = [
      story({ id: "new", created_at: "2026-10-20T00:00:00Z" }),
      story({ id: "old", created_at: "2026-10-01T00:00:00Z" }),
      story({ id: "live", status: "live" }),
    ];
    const { featured, rest } = storiesForTab(list, "waiting");
    expect(featured).toEqual([]);
    expect(rest.map((s) => s.id)).toEqual(["old", "new"]);
  });

  it("puts featured Live stories first in their order, then the rest newest first", () => {
    const list = [
      story({ id: "a", status: "live", decided_at: "2026-10-02T00:00:00Z" }),
      story({ id: "b", status: "live", decided_at: "2026-10-05T00:00:00Z" }),
      story({ id: "f2", status: "live", featured: true, featured_order: 2 }),
      story({ id: "f1", status: "live", featured: true, featured_order: 1 }),
      story({ id: "c", status: "live", decided_at: null, created_at: "2026-10-03T00:00:00Z" }),
    ];
    const { featured, rest } = storiesForTab(list, "live");
    expect(featured.map((s) => s.id)).toEqual(["f1", "f2"]);
    expect(rest.map((s) => s.id)).toEqual(["b", "c", "a"]);
  });

  it("orders Hidden and Declined newest first", () => {
    const list = [
      story({ id: "x", status: "hidden", decided_at: "2026-10-01T00:00:00Z" }),
      story({ id: "y", status: "hidden", decided_at: "2026-10-09T00:00:00Z" }),
    ];
    expect(storiesForTab(list, "hidden").rest.map((s) => s.id)).toEqual(["y", "x"]);
  });

  it("does not show featured stories that are not live in the strip", () => {
    const list = [story({ id: "h", status: "hidden", featured: true, featured_order: 1 })];
    expect(storiesForTab(list, "hidden")).toEqual({ featured: [], rest: list });
  });
});

describe("nextFeaturedOrder", () => {
  it("goes after the last featured story", () => {
    expect(nextFeaturedOrder([])).toBe(1);
    expect(
      nextFeaturedOrder([
        story({ featured: true, featured_order: 3 }),
        story({ featured: true, featured_order: 1 }),
        story({ featured: false, featured_order: 9 }),
      ]),
    ).toBe(4);
  });
});

describe("shownPhoto", () => {
  it("uses the signed private photo while there is a pending one", () => {
    const s = story({ pending_photo_path: "2026/a.jpg", photo_url: "https://x/old.jpg" });
    expect(shownPhoto(s, { "2026/a.jpg": "https://signed" })).toBe("https://signed");
    expect(shownPhoto(s, {})).toBeNull();
  });
  it("uses the public photo otherwise", () => {
    expect(shownPhoto(story({ photo_url: "https://x/p.jpg" }), {})).toBe("https://x/p.jpg");
  });
});

describe("barActions", () => {
  const kinds = (s: AdminStory) => barActions(s).map((a) => a.kind);

  it("Waiting: Publish (gold) and Decline", () => {
    const actions = barActions(story());
    expect(actions.map((a) => a.kind)).toEqual(["publish", "decline"]);
    expect(actions[0]).toMatchObject({ label: "Publish", variant: "primary" });
  });
  it("Live: Feature on home toggle and Hide from site", () => {
    const actions = barActions(story({ status: "live", featured: true }));
    expect(actions.map((a) => a.kind)).toEqual(["feature", "hide"]);
    expect(actions[0]).toMatchObject({ label: "Feature on home", pressed: true });
    expect(actions[1].label).toBe("Hide from site");
  });
  it("Hidden: Show on site and Delete permanently", () => {
    expect(kinds(story({ status: "hidden" }))).toEqual(["show", "delete"]);
    expect(barActions(story({ status: "hidden" }))[1]).toMatchObject({
      label: "Delete permanently",
      variant: "danger",
    });
  });
  it("Declined: Restore and Delete, plus Invite again when it came from an invite", () => {
    expect(kinds(story({ status: "declined" }))).toEqual(["restore", "delete"]);
    expect(kinds(story({ status: "declined", invite_id: "i1" }))).toEqual([
      "restore",
      "invite-again",
      "delete",
    ]);
  });
});

describe("possessive and outcomeText", () => {
  it("uses the first name", () => {
    expect(possessive("Keith Mrema")).toBe("Keith's");
    expect(possessive("  ")).toBe("this person's");
  });
  it("says what happened, with the cache window where the site changes", () => {
    expect(outcomeText("publish", "Keith Mrema")).toBe(
      "Published Keith's story. It will appear on the website within about 5 minutes.",
    );
    expect(outcomeText("decline", "Keith")).toBe(
      "Declined Keith's story. It is kept under Declined.",
    );
    expect(outcomeText("hide", "Keith")).toContain("within about 5 minutes");
    expect(outcomeText("show", "Keith")).toContain("within about 5 minutes");
    expect(outcomeText("restore", "Keith")).toBe("Moved Keith's story back to Waiting.");
    expect(outcomeText("delete", "Keith")).toBe("Deleted Keith's story.");
    expect(outcomeText("feature", "Keith")).toContain("home page");
    expect(outcomeText("unfeature", "Keith")).toContain("no longer featured");
  });
});

describe("cardLines", () => {
  const now = new Date("2026-10-23T09:00:00Z");
  it("former student: role and class; dated by when it was sent", () => {
    const lines = cardLines(
      story({ grad_year: 2018, relationship: "Pilot", created_at: "2026-10-03T09:00:00Z" }),
      now,
    );
    expect(lines.role).toBe("Pilot · Class of 2018");
    expect(lines.date).toBe("Sent 3 Oct");
  });
  it("parent: relationship or Parent", () => {
    expect(cardLines(story(), now).role).toBe("Parent");
    expect(cardLines(story({ relationship: "Parent, Form 3" }), now).role).toBe("Parent, Form 3");
  });
  it("live stories are dated by when they were published", () => {
    const lines = cardLines(story({ status: "live", decided_at: "2026-10-10T09:00:00Z" }), now);
    expect(lines.date).toBe("Published 10 Oct");
  });
  it("a typed-in story that was never live says Added", () => {
    expect(cardLines(story({ status: "hidden" }), now).date).toBe("Added 1 Oct");
  });
});

describe("storySource", () => {
  it("names where a story came from", () => {
    expect(storySource(story({ invite_id: "i" }))).toBe("Personal invite");
    expect(storySource(story({ answers: { previous_invite_id: "i" } }))).toContain(
      "Personal invite",
    );
    expect(storySource(story({ consent_text: STAFF_CONSENT_TEXT }))).toBe("Typed in by staff");
    expect(storySource(story({ consent_at: null, consent_text: null }))).toBe("Added by staff");
    expect(storySource(story())).toBe("General link");
  });
});

describe("story form", () => {
  it("reads a story into the form, choosing the speaker from the class year", () => {
    expect(storyToForm(story({ grad_year: 2018 }))).toMatchObject({
      speaker: "alumni",
      grad_year: "2018",
    });
    expect(storyToForm(story())).toMatchObject({ speaker: "parent", grad_year: "" });
    expect(storyToForm(story({ school_slug: null })).school_slug).toBe("group-wide");
  });

  it("a new story starts with no speaker chosen", () => {
    expect(EMPTY_STORY_FORM.speaker).toBe("");
  });

  it("requires a speaker, a name, words and a school", () => {
    const errors = validateStoryForm({ ...EMPTY_STORY_FORM, school_slug: "" }, { isNew: false });
    expect(Object.keys(errors).sort()).toEqual(["author_name", "quote", "school_slug", "speaker"]);
  });

  it("requires Class of for a former student, and a real year", () => {
    const f = { ...storyToForm(story()), speaker: "alumni" as const };
    expect(validateStoryForm(f, { isNew: false, thisYear: 2026 }).grad_year).toBeTruthy();
    expect(
      validateStoryForm({ ...f, grad_year: "0" }, { isNew: false, thisYear: 2026 }).grad_year,
    ).toBeTruthy();
    expect(
      validateStoryForm({ ...f, grad_year: "2030" }, { isNew: false, thisYear: 2026 }).grad_year,
    ).toBeTruthy();
    expect(
      validateStoryForm({ ...f, grad_year: "2018" }, { isNew: false, thisYear: 2026 }),
    ).toEqual({});
  });

  it("ignores Class of for a parent", () => {
    const f = { ...storyToForm(story()), grad_year: "nonsense" };
    expect(validateStoryForm(f, { isNew: false })).toEqual({});
  });

  it("a new story needs the agreement ticked", () => {
    const f = { ...storyToForm(story()), consent: false };
    expect(validateStoryForm(f, { isNew: true }).consent).toBeTruthy();
    expect(validateStoryForm({ ...f, consent: true }, { isNew: true })).toEqual({});
  });

  it("turns the form into an edit: a parent never keeps a class year", () => {
    const f = { ...storyToForm(story({ grad_year: 2018 })), speaker: "parent" as const };
    expect(formToEdit(f).grad_year).toBeNull();
    const a = { ...storyToForm(story()), speaker: "alumni" as const, grad_year: " 2019 " };
    expect(formToEdit(a).grad_year).toBe(2019);
  });

  it("is dirty only when something changed", () => {
    const s = story();
    expect(isFormDirty(storyToForm(s), s)).toBe(false);
    expect(isFormDirty({ ...storyToForm(s), quote: "Changed" }, s)).toBe(true);
    expect(isFormDirty(EMPTY_STORY_FORM, null)).toBe(false);
    expect(isFormDirty({ ...EMPTY_STORY_FORM, author_name: "A" }, null)).toBe(true);
  });
});

describe("hiding a featured story", () => {
  it("takes it off the home page in the same update", () => {
    expect(moveExtra("hide")).toEqual({ featured: false, featured_order: null });
    for (const a of ["publish", "decline", "restore", "show"] as const) {
      expect(moveExtra(a)).toEqual({});
    }
  });
  it("Undo of Hide puts both featured values back", () => {
    expect(undoMoveExtra("hide", story({ featured: true, featured_order: 3 }))).toEqual({
      featured: true,
      featured_order: 3,
    });
    expect(undoMoveExtra("hide", story())).toEqual({ featured: false, featured_order: null });
    expect(undoMoveExtra("show", story({ featured: true, featured_order: 3 }))).toEqual({});
  });
});

describe("refeatureOrder", () => {
  it("gives an unfeatured story its old place back", () => {
    const list = [story({ id: "a", featured: true, featured_order: 1 })];
    expect(refeatureOrder("s1", 2, list)).toBe(2);
  });
  it("goes last when the old place has been taken, or there was none", () => {
    const list = [
      story({ id: "a", featured: true, featured_order: 1 }),
      story({ id: "b", featured: true, featured_order: 2 }),
    ];
    expect(refeatureOrder("s1", 2, list)).toBe(3);
    expect(refeatureOrder("s1", null, list)).toBe(3);
  });
});
