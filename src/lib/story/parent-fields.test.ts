import { describe, it, expect } from "vitest";
import { StoryError } from "./fields";
import {
  EMPTY_PARENT_DRAFT,
  PARENT_CONSENT_TEXT,
  PARENT_PROMPTS,
  checkParentAbout,
  checkParentPrompts,
  parentDraftToForm,
  validateParentStory,
  type ParentDraft,
} from "./parent-fields";

const CODE = "b".repeat(43);

const good: ParentDraft = {
  ...EMPTY_PARENT_DRAFT,
  fullName: " Grace Mollel ",
  schoolSlug: "alpha-girls",
  answers: { chose_alpha: "The aviation programme.", changed: "", advice_parents: "" },
  quote: "Our daughter found her confidence here.",
  consent: true,
};

describe("parent prompts", () => {
  it("uses the agreed questions", () => {
    expect(PARENT_PROMPTS.map((p) => p.label)).toEqual([
      "Why did you choose Alpha?",
      "What has changed for your child since joining?",
      "What would you tell a parent deciding now?",
    ]);
  });
});

describe("parent consent wording", () => {
  it("covers the school the quote is published with", () => {
    expect(PARENT_CONSENT_TEXT).toContain("the school my child attends");
    expect(PARENT_CONSENT_TEXT).toContain("request removal at any time");
  });
});

describe("parent checks", () => {
  it("pass a complete draft", () => {
    expect(checkParentAbout(good)).toBeNull();
    expect(checkParentPrompts(good)).toBeNull();
  });

  it.each([
    [{ fullName: " " }, "Please enter your name."],
    [{ fullName: "x".repeat(121) }, "That name is too long."],
    [{ schoolSlug: "" }, "Please choose your child's school."],
    [{ schoolSlug: "group-wide" }, "Please choose your child's school."],
  ])("checkParentAbout rejects %j", (patch, message) => {
    expect(checkParentAbout({ ...good, ...patch })).toBe(message);
  });

  it("limits each answer", () => {
    const answers = { ...good.answers, changed: "x".repeat(601) };
    expect(checkParentPrompts({ ...good, answers })).toBe(
      "Please keep each answer under 600 characters.",
    );
  });
});

describe("validateParentStory", () => {
  it("round-trips a draft and builds the attribution", () => {
    const form = parentDraftToForm(good, CODE, null);
    expect(form.get("audience")).toBe("parent");
    expect(validateParentStory(form)).toEqual({
      code: CODE,
      fullName: "Grace Mollel",
      schoolSlug: "alpha-girls",
      relationship: "Parent, Alpha Girls",
      answers: { chose_alpha: "The aviation programme." },
      quote: "Our daughter found her confidence here.",
    });
  });

  it("treats no code as the general link and blank answers as null", () => {
    const draft = { ...good, answers: { chose_alpha: " ", changed: "", advice_parents: "" } };
    const input = validateParentStory(parentDraftToForm(draft, null, null));
    expect(input.code).toBeNull();
    expect(input.answers).toBeNull();
  });

  it.each([
    [{ quote: "" }, "Please write a sentence or two for your quote."],
    [{ quote: "x".repeat(401) }, "Please keep your quote under 400 characters."],
    [{ consent: false }, "Please agree to the consent statement to submit."],
    [{ schoolSlug: "" }, "Please choose your child's school."],
  ])("rejects %j", (patch, message) => {
    const form = parentDraftToForm({ ...good, ...patch }, null, null);
    expect(() => validateParentStory(form)).toThrow(new StoryError(message));
  });

  it("rejects a malformed code", () => {
    expect(() => validateParentStory(parentDraftToForm(good, "short", null))).toThrow(
      new StoryError("This link isn't valid any more."),
    );
  });

  it("carries the photo", () => {
    const photo = new File([new Uint8Array([1])], "me.jpg");
    expect(parentDraftToForm(good, null, photo).get("photo")).toBeInstanceOf(File);
  });
});
