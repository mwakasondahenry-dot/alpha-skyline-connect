import { describe, it, expect } from "vitest";
import {
  ALUMNI_QUESTION,
  EMPTY_DRAFT,
  MESSAGE_MAX,
  StoryError,
  checkAbout,
  checkConsent,
  checkNow,
  checkQuote,
  checkStory,
  draftToForm,
  validateStory,
  type StoryDraft,
} from "./fields";

const YEAR = 2026;
const CODE = "a".repeat(43);

const good: StoryDraft = {
  ...EMPTY_DRAFT,
  fullName: " Asha Mushi ",
  schoolSlug: "alpha-high",
  gradYear: "2018",
  role: "Pilot",
  quote: "Alpha taught me to aim high.",
  consent: true,
};

describe("the form", () => {
  it("asks one published question and nothing unpublished", () => {
    expect(ALUMNI_QUESTION).toBe("What did Alpha give you that you still use today?");
    expect(Object.keys(EMPTY_DRAFT).sort()).toEqual(
      ["consent", "fullName", "gradYear", "quote", "role", "schoolSlug"].sort(),
    );
  });
});

describe("checks", () => {
  it("pass a complete draft", () => {
    expect(checkAbout(good, YEAR)).toBeNull();
    for (const check of [checkNow, checkQuote, checkConsent]) {
      expect(check(good)).toBeNull();
    }
    expect(checkStory(good, YEAR)).toBeNull();
  });

  it.each([
    [{ fullName: "  " }, "Please enter your name."],
    [{ schoolSlug: "" }, "Please choose the school you attended."],
    [{ schoolSlug: "group-wide" }, "Please choose the school you attended."],
    [{ gradYear: "" }, "Please enter the year you finished, e.g. 2018."],
    [{ gradYear: "1959" }, "Please enter the year you finished, e.g. 2018."],
    [{ gradYear: "2028" }, "Please enter the year you finished, e.g. 2018."],
  ])("checkAbout rejects %j", (patch, message) => {
    expect(checkAbout({ ...good, ...patch }, YEAR)).toBe(message);
  });

  it("checkNow requires one line on what they do", () => {
    expect(checkNow({ role: " " })).toBe("Please tell us what you do now.");
    expect(checkNow({ role: "x".repeat(121) })).toBe("That is too long for one line.");
  });

  it("checkQuote requires a short answer", () => {
    expect(checkQuote({ quote: "" })).toBe("Please answer the question in a sentence or two.");
    expect(checkQuote({ quote: "x".repeat(MESSAGE_MAX + 1) })).toBe(
      `Please keep your answer under ${MESSAGE_MAX} characters.`,
    );
  });

  it("checkConsent requires the box", () => {
    expect(checkConsent({ consent: false })).toBe(
      "Please tick the box to let us publish your answer.",
    );
  });

  it("checkStory reports the first problem in form order", () => {
    expect(checkStory({ ...good, role: "", quote: "" }, YEAR)).toBe(
      "Please tell us what you do now.",
    );
  });
});

describe("validateStory", () => {
  it("round-trips a draft through FormData", () => {
    expect(validateStory(draftToForm(good, CODE, null), YEAR)).toEqual({
      code: CODE,
      fullName: "Asha Mushi",
      schoolSlug: "alpha-high",
      gradYear: 2018,
      role: "Pilot",
      quote: "Alpha taught me to aim high.",
    });
  });

  it("treats a missing code as the general link", () => {
    expect(validateStory(draftToForm(good, null, null), YEAR).code).toBeNull();
  });

  it("rejects a malformed code", () => {
    expect(() => validateStory(draftToForm(good, "short", null), YEAR)).toThrow(
      new StoryError("This link isn't valid any more."),
    );
  });

  it("throws the first problem as a StoryError", () => {
    const form = draftToForm({ ...good, consent: false }, null, null);
    expect(() => validateStory(form, YEAR)).toThrow(StoryError);
  });

  it("carries the photo", () => {
    const photo = new File([new Uint8Array([1, 2, 3])], "me.jpg");
    expect(draftToForm(good, null, photo).get("photo")).toBeInstanceOf(File);
  });
});
