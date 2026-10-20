/**
 * Decisions behind the home-page video, kept free of React and the YouTube
 * API so they can be tested on their own. The component in
 * src/components/home-video.tsx owns the side effects.
 */

/** "Alpha Advert" on youtube.com/@alphaschoolstz. */
export const HOME_VIDEO_ID = "qoNGalen6Uk";

export type StartMode = "autoplay" | "tap-to-play";

/**
 * Autoplay is the default, but not for a reader who asked the device for
 * less motion or less data. They get the still and a play button, and the
 * player does not load at all until they tap it.
 */
export function startMode(prefs: { reducedMotion: boolean; saveData: boolean }): StartMode {
  return prefs.reducedMotion || prefs.saveData ? "tap-to-play" : "autoplay";
}

/**
 * Whether the player should be running right now.
 *
 * Leaving the screen always pauses — nobody watches a video they have
 * scrolled past, and it keeps streaming on mobile data otherwise. A pause
 * the reader chose sticks until they press play again.
 */
export function shouldPlay(s: {
  mode: StartMode;
  inView: boolean;
  userPaused: boolean;
  userStarted: boolean;
}): boolean {
  if (!s.inView || s.userPaused) return false;
  return s.mode === "autoplay" || s.userStarted;
}

/**
 * The iframe URL. No `autoplay` parameter: playback is started through the
 * IFrame API once the section is on screen, so the attempt with sound and
 * the muted fallback both happen in one place.
 */
export function embedSrc(id: string, origin: string): string {
  const params = new URLSearchParams({
    enablejsapi: "1",
    origin,
    controls: "0",
    playsinline: "1",
    rel: "0",
    loop: "1",
    playlist: id,
    disablekb: "1",
    iv_load_policy: "3",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

/** 1280×720 WebP, about 46 KB — the only thing that loads before the player. */
export function thumbnailSrc(id: string): string {
  return `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`;
}
