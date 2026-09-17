import { describe, it, expect } from "vitest";
import {
  EMPTY_DRAFT,
  MESSAGE_MAX,
  PROMPT_MAX,
  StoryError,
  checkAbout,
  checkConsent,
  checkNow,
  checkPrompts,
  checkQuote,
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
  company: "",
  cityCountry: "Dar es Salaam",
  answers: { gave_you: "Confidence", moment: "", advice: "" },
  quote: "Alpha taught me to aim high.",
  consent: true,
};

describe("step checks", () => {
  it("pass a complete draft", () => {
    expect(checkAbout(good, YEAR)).toBeNull();
    for (const check of [checkNow, checkPrompts, checkQuote, checkConsent]) {
      expect(check(good)).toBeNull();
    }
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

  it("checkNow requires a role and limits lengths", () => {
    expect(checkNow({ ...good, role: " " })).toBe("Please tell us what you do now.");
    expect(checkNow({ ...good, company: "x".repeat(121) })).toBe("That company name is too long.");
    expect(checkNow({ ...good, cityCountry: "x".repeat(81) })).toBe("That place name is too long.");
  });

  it("checkPrompts limits each answer", () => {
    const answers = { ...good.answers, advice: "x".repeat(PROMPT_MAX + 1) };
    expect(checkPrompts({ ...good, answers })).toBe(
      `Please keep each answer under ${PROMPT_MAX} characters.`,
    );
  });

  it("checkQuote requires a short quote", () => {
    expect(checkQuote({ ...good, quote: "" })).toBe("Please write a sentence or two for your quote.");
    expect(checkQuote({ ...good, quote: "x".repeat(MESSAGE_MAX + 1) })).toBe(
      `Please keep your quote under ${MESSAGE_MAX} characters.`,
    );
  });

  it("checkConsent requires the box", () => {
    expect(checkConsent({ ...good, consent: false })).toBe(
      "Please agree to the consent statement to submit.",
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
      company: null,
      cityCountry: "Dar es Salaam",
      answers: { gave_you: "Confidence" },
      quote: "Alpha taught me to aim high.",
    });
  });

  it("treats a missing code as the general link and empty answers as null", () => {
    const draft = { ...good, answers: { gave_you: " ", moment: "", advice: "" } };
    const input = validateStory(draftToForm(draft, null, null), YEAR);
    expect(input.code).toBeNull();
    expect(input.answers).toBeNull();
  });

  it("rejects a malformed code", () => {
    expect(() => validateStory(draftToForm(good, "short", null), YEAR)).toThrow(
      new StoryError("This link isn't valid any more."),
    );
  });

  it("throws the first step problem as a StoryError", () => {
    const form = draftToForm({ ...good, consent: false }, null, null);
    expect(() => validateStory(form, YEAR)).toThrow(StoryError);
  });

  it("carries the photo", () => {
    const photo = new File([new Uint8Array([1, 2, 3])], "me.jpg");
    expect(draftToForm(good, null, photo).get("photo")).toBeInstanceOf(File);
  });
});
