import { describe, expect, it } from "vitest";
import {
  VIDEO_HOSTS,
  embedSrc,
  firstPlay,
  preloadsPlayer,
  shouldPlay,
  startMode,
  thumbnailSrc,
} from "./home-video";

describe("preloadsPlayer", () => {
  it("builds the player early for a reader who will get autoplay", () => {
    expect(preloadsPlayer("autoplay")).toBe(true);
  });
  it("loads nothing in advance for a reader who must tap play", () => {
    expect(preloadsPlayer("tap-to-play")).toBe(false);
  });
});

describe("firstPlay", () => {
  it("starts muted at once when the browser says the reader has not tapped yet", () => {
    expect(firstPlay(false)).toBe("muted");
  });
  it("asks for sound once the reader has tapped the page", () => {
    expect(firstPlay(true)).toBe("sound");
  });
  it("asks for sound in a browser that cannot say", () => {
    expect(firstPlay(undefined)).toBe("sound");
  });
});

describe("VIDEO_HOSTS", () => {
  it("names the embed host and the API host, once each", () => {
    expect(VIDEO_HOSTS).toContain("https://www.youtube-nocookie.com");
    expect(VIDEO_HOSTS).toContain("https://www.youtube.com");
    expect(new Set(VIDEO_HOSTS).size).toBe(VIDEO_HOSTS.length);
    for (const h of VIDEO_HOSTS) expect(h).toMatch(/^https:\/\/[a-z.-]+$/);
  });
});

describe("startMode", () => {
  it("autoplays for a reader with no preferences set", () => {
    expect(startMode({ reducedMotion: false, saveData: false })).toBe("autoplay");
  });

  it("waits for a tap when the reader asked for reduced motion", () => {
    expect(startMode({ reducedMotion: true, saveData: false })).toBe("tap-to-play");
  });

  it("waits for a tap when the reader is saving data", () => {
    expect(startMode({ reducedMotion: false, saveData: true })).toBe("tap-to-play");
  });
});

describe("shouldPlay", () => {
  const base = { mode: "autoplay" as const, inView: true, userPaused: false, userStarted: false };

  it("plays an autoplay video that is on screen", () => {
    expect(shouldPlay(base)).toBe(true);
  });

  it("pauses once the video leaves the screen", () => {
    expect(shouldPlay({ ...base, inView: false })).toBe(false);
  });

  it("stays paused on screen after the reader paused it", () => {
    expect(shouldPlay({ ...base, userPaused: true })).toBe(false);
  });

  it("never starts a tap-to-play video on its own", () => {
    expect(shouldPlay({ ...base, mode: "tap-to-play" })).toBe(false);
  });

  it("plays a tap-to-play video once the reader tapped play", () => {
    expect(shouldPlay({ ...base, mode: "tap-to-play", userStarted: true })).toBe(true);
  });

  it("still pauses a tapped video when it leaves the screen", () => {
    expect(shouldPlay({ ...base, mode: "tap-to-play", userStarted: true, inView: false })).toBe(
      false,
    );
  });
});

describe("embedSrc", () => {
  const url = new URL(embedSrc("abc123", "https://alphaschools.ac.tz"));

  it("uses the privacy-enhanced domain", () => {
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe("/embed/abc123");
  });

  it("enables the JS API for the page's own origin", () => {
    expect(url.searchParams.get("enablejsapi")).toBe("1");
    expect(url.searchParams.get("origin")).toBe("https://alphaschools.ac.tz");
  });

  it("hides YouTube's controls and plays inline on iOS", () => {
    expect(url.searchParams.get("controls")).toBe("0");
    expect(url.searchParams.get("playsinline")).toBe("1");
  });

  it("loops the single video", () => {
    expect(url.searchParams.get("loop")).toBe("1");
    expect(url.searchParams.get("playlist")).toBe("abc123");
  });

  it("does not autoplay from the URL — playback is driven by the API", () => {
    expect(url.searchParams.get("autoplay")).toBeNull();
  });
});

describe("thumbnailSrc", () => {
  it("points at the full-resolution WebP still", () => {
    expect(thumbnailSrc("abc123")).toBe("https://i.ytimg.com/vi_webp/abc123/maxresdefault.webp");
  });
});
