import { describe, it, expect } from "vitest";
import { firstName, generalMessage, inviteMessage, whatsappUrl, parentInviteMessage, parentGeneralMessage } from "./whatsapp";

const PITCH =
  "Alpha Schools is building an alumni platform and digital network for our former students, " +
  "and we would love you to be part of it. Start by sharing your story, it takes a minute:";

describe("whatsapp", () => {
  it("uses the first name, or a neutral greeting", () => {
    expect(firstName("  Asha   Mushi ")).toBe("Asha");
    expect(firstName("   ")).toBe("there");
  });

  it("writes the alumni invite around the alumni platform", () => {
    expect(inviteMessage("Asha Mushi", "https://x.test/alumni/story/abc")).toBe(
      `Hello Asha, ${PITCH} https://x.test/alumni/story/abc`,
    );
  });

  it("writes the general alumni message", () => {
    expect(generalMessage("https://x.test/alumni/story")).toBe(
      `Did you study at Alpha? ${PITCH} https://x.test/alumni/story`,
    );
  });

  it("addresses a number with digits only", () => {
    expect(whatsappUrl("+255712345678", "Hi & bye")).toBe(
      "https://wa.me/255712345678?text=Hi%20%26%20bye",
    );
  });

  it("lets the sender pick the chat when there is no number", () => {
    expect(whatsappUrl(null, "Hi")).toBe("https://wa.me/?text=Hi");
  });

  it("writes the parent invite message", () => {
    expect(parentInviteMessage("Asha Mushi", "https://x.test/parents/story/abc")).toBe(
      "Hello Asha, Alpha Schools would love to share your experience as a parent on our website. " +
        "It takes a minute: https://x.test/parents/story/abc",
    );
  });

  it("writes the parent general message", () => {
    expect(parentGeneralMessage("https://x.test/parents/story")).toBe(
      "Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. " +
        "It takes a minute: https://x.test/parents/story",
    );
  });
});
