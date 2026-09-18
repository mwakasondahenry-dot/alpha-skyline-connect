import { describe, it, expect } from "vitest";
import { firstName, generalMessage, inviteMessage, whatsappUrl, parentInviteMessage, parentGeneralMessage } from "./whatsapp";

describe("whatsapp", () => {
  it("uses the first name, or a neutral greeting", () => {
    expect(firstName("  Asha   Mushi ")).toBe("Asha");
    expect(firstName("   ")).toBe("there");
  });

  it("writes the invite message", () => {
    expect(inviteMessage("Asha Mushi", "https://x.test/alumni/story/abc")).toBe(
      "Hello Asha, Alpha Schools would love to feature your story on our alumni page. " +
        "It takes about 5 minutes: https://x.test/alumni/story/abc",
    );
  });

  it("writes the general message", () => {
    expect(generalMessage("https://x.test/alumni/story")).toBe(
      "Did you study at Alpha? Alpha Schools would love to feature your story on our alumni page. " +
        "It takes about 5 minutes: https://x.test/alumni/story",
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
        "It takes about 5 minutes: https://x.test/parents/story/abc",
    );
  });

  it("writes the parent general message", () => {
    expect(parentGeneralMessage("https://x.test/parents/story")).toBe(
      "Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. " +
        "It takes about 5 minutes: https://x.test/parents/story",
    );
  });
});
