import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isCrudFormChanged,
  dateCellLabel,
  dateInputValue,
  initialValue,
  itemNameOf,
  outcomeLine,
  rowName,
  saveValue,
  todayInDar,
} from "./admin-crud-defaults";

describe("initialValue", () => {
  it("leaves a nullable number empty when there is no value", () => {
    expect(initialValue({ type: "number", nullable: true }, null)).toBe("");
    expect(initialValue({ type: "number", nullable: true }, undefined)).toBe("");
  });

  it("never invents 0 for a number without a declared default", () => {
    expect(initialValue({ type: "number" }, null)).toBe("");
  });

  it("uses a declared defaultValue of 0", () => {
    expect(initialValue({ type: "number", defaultValue: 0 }, null)).toBe(0);
  });

  it("keeps an existing number", () => {
    expect(initialValue({ type: "number", nullable: true }, 5)).toBe(5);
    expect(initialValue({ type: "number", defaultValue: 0 }, 5)).toBe(5);
  });

  it("keeps an existing 0 rather than replacing it", () => {
    expect(initialValue({ type: "number", defaultValue: 3 }, 0)).toBe(0);
  });

  it("gives text an empty string when there is no value", () => {
    expect(initialValue({ type: "text" }, null)).toBe("");
  });

  it("uses a boolean's declared default when there is no value", () => {
    expect(initialValue({ type: "boolean", defaultValue: true }, null)).toBe(true);
  });

  it("keeps an existing false over a true default", () => {
    expect(initialValue({ type: "boolean", defaultValue: true }, false)).toBe(false);
  });

  it("gives a boolean with no default false", () => {
    expect(initialValue({ type: "boolean" }, undefined)).toBe(false);
  });

  it("shows a timestamp as its date in Dar es Salaam for a date input", () => {
    expect(initialValue({ type: "date" }, "2026-10-20T00:00:00+00:00")).toBe("2026-10-20");
    // 22:30 UTC on the 20th is 01:30 on the 21st in Dar es Salaam.
    expect(initialValue({ type: "date" }, "2026-10-20T22:30:00Z")).toBe("2026-10-21");
  });

  it("keeps a plain date as it is", () => {
    expect(initialValue({ type: "date" }, "2026-10-20")).toBe("2026-10-20");
  });

  it("gives an empty date input when there is no value", () => {
    expect(initialValue({ type: "date" }, null)).toBe("");
  });
});

describe("dateInputValue", () => {
  it("returns empty for something that is not a date", () => {
    expect(dateInputValue("not a date")).toBe("");
    expect(dateInputValue(42)).toBe("");
  });
});

describe("saveValue", () => {
  it("saves an emptied nullable number as null, not 0", () => {
    expect(saveValue({ type: "number", nullable: true }, "")).toBeNull();
  });

  it("saves an emptied number that has a default as that default", () => {
    expect(saveValue({ type: "number", defaultValue: 0 }, "")).toBe(0);
  });

  it("turns typed digits into a number", () => {
    expect(saveValue({ type: "number" }, "12")).toBe(12);
  });

  it("saves empty text as null", () => {
    expect(saveValue({ type: "text" }, "")).toBeNull();
  });

  it("keeps the original timestamp when the date was not changed", () => {
    const original = "2026-10-20T09:15:00+00:00";
    expect(saveValue({ type: "date" }, "2026-10-20", original)).toBe(original);
  });

  it("saves a changed date as the picked day", () => {
    expect(saveValue({ type: "date" }, "2026-10-22", "2026-10-20T09:15:00+00:00")).toBe(
      "2026-10-22",
    );
  });
});

describe("today as a default", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves "today" when the form opens, as the Dar es Salaam day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T09:00:00Z"));
    expect(initialValue({ type: "date", defaultValue: "today" }, null)).toBe("2026-10-23");
    // Not frozen at first use: a later open gets the later day.
    vi.setSystemTime(new Date("2026-10-25T09:00:00Z"));
    expect(initialValue({ type: "date", defaultValue: "today" }, null)).toBe("2026-10-25");
  });

  it("is already tomorrow just after 21:00 UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T21:05:00Z"));
    expect(todayInDar()).toBe("2026-10-24");
    expect(initialValue({ type: "date", defaultValue: "today" }, undefined)).toBe("2026-10-24");
  });

  it("keeps an existing date over the today default", () => {
    expect(initialValue({ type: "date", defaultValue: "today" }, "2026-01-02")).toBe("2026-01-02");
  });
});

describe("dateCellLabel", () => {
  const now = new Date("2026-10-23T09:00:00Z");
  it("shows a picked date without a time", () => {
    expect(dateCellLabel("2026-10-01", now)).toBe("1 Oct");
    expect(dateCellLabel("2025-10-01", now)).toBe("1 Oct 2025");
  });
  it("shows a timestamp as its Dar es Salaam day, without a time", () => {
    expect(dateCellLabel("2026-10-01T22:30:00Z", now)).toBe("2 Oct");
    expect(dateCellLabel("2026-10-23T00:00:00+00:00", now)).toBe("23 Oct");
  });
  it("is empty for something that is not a date", () => {
    expect(dateCellLabel("soon", now)).toBe("");
  });
});

describe("naming a row", () => {
  const staff = {
    nameKey: "name",
    listColumns: [{ key: "photo_url" }, { key: "name" }, { key: "title" }],
  };
  const row = { name: "Grace Mushi", title: "Head Teacher", photo_url: "https://x/y.webp" };

  it("uses the configured nameKey, so a staff member is named, not their role", () => {
    expect(rowName(row, staff)).toBe("Grace Mushi");
  });

  it("without a nameKey, uses the first name-like list column", () => {
    expect(rowName(row, { listColumns: staff.listColumns })).toBe("Grace Mushi");
  });

  it("falls back to title, name, caption, alt text", () => {
    expect(rowName({ caption: "Sports day" }, { listColumns: [] })).toBe("Sports day");
    expect(rowName({ school_slug: "alpha-high" }, { listColumns: [{ key: "school_slug" }] })).toBe(
      null,
    );
  });

  it("skips an empty nameKey value", () => {
    expect(rowName({ name: " ", title: "Head" }, { nameKey: "name", listColumns: [] })).toBe(
      "Head",
    );
  });

  it("names the item from config", () => {
    expect(itemNameOf({ title: "Staff", itemName: "staff member" })).toBe("staff member");
    expect(itemNameOf({ title: "Facilities" })).toBe("facility");
    expect(itemNameOf({ title: "Hero slides" })).toBe("hero slide");
    expect(itemNameOf({ title: "News" })).toBe("news");
  });

  it("writes the outcome line with the name, or the item when there is none", () => {
    expect(outcomeLine("Deleted", row, "staff member", staff)).toBe("Deleted “Grace Mushi”.");
    expect(outcomeLine("Saved", {}, "photo", { listColumns: [] })).toBe("Saved the photo.");
  });
});

describe("isCrudFormChanged", () => {
  const start = { title: "Sports day", sort_order: 3, published: false, image_url: "" };
  it("is clean when nothing differs, even when a number came back as typed text", () => {
    expect(isCrudFormChanged(start, start)).toBe(false);
    expect(isCrudFormChanged({ ...start, sort_order: "3" }, start)).toBe(false);
    expect(isCrudFormChanged({ ...start, image_url: null }, start)).toBe(false);
  });
  it("is dirty when any field differs", () => {
    expect(isCrudFormChanged({ ...start, title: "Sports day!" }, start)).toBe(true);
    expect(isCrudFormChanged({ ...start, published: true }, start)).toBe(true);
    expect(isCrudFormChanged({ ...start, image_url: "https://x/y.webp" }, start)).toBe(true);
  });
});
