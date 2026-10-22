import { describe, it, expect } from "vitest";
import { StoryError } from "./fields";
import {
  EMPTY_PARENT_DRAFT,
  PARENT_CONSENT_TEXT,
  PARENT_QUESTION,
  checkParentAbout,
  checkParentStory,
  parentDraftToForm,
  validateParentStory,
  type ParentDraft,
} from "./parent-fields";

const CODE = "b".repeat(43);

const good: ParentDraft = {
  ...EMPTY_PARENT_DRAFT,
  fullName: " Grace Mollel ",
  schoolSlug: "alpha-girls",
  quote: "Our daughter found her confidence here.",
  consent: true,
};

describe("the form", () => {
  it("asks one published question and nothing unpublished", () => {
    expect(PARENT_QUESTION).toBe("What has Alpha done for your child?");
    expect(Object.keys(EMPTY_PARENT_DRAFT).sort()).toEqual(
      ["consent", "fullName", "quote", "schoolSlug"].sort(),
    );
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
    expect(checkParentStory(good)).toBeNull();
  });

  it.each([
    [{ fullName: " " }, "Please enter your name."],
    [{ fullName: "x".repeat(121) }, "That name is too long."],
    [{ schoolSlug: "" }, "Please choose your child's school."],
    [{ schoolSlug: "group-wide" }, "Please choose your child's school."],
  ])("checkParentAbout rejects %j", (patch, message) => {
    expect(checkParentAbout({ ...good, ...patch })).toBe(message);
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
      quote: "Our daughter found her confidence here.",
    });
  });

  it("treats no code as the general link", () => {
    expect(validateParentStory(parentDraftToForm(good, null, null)).code).toBeNull();
  });

  it.each([
    [{ quote: "" }, "Please answer the question in a sentence or two."],
    [{ quote: "x".repeat(401) }, "Please keep your answer under 400 characters."],
    [{ consent: false }, "Please tick the box to let us publish your answer."],
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
