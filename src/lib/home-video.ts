/**
 * Decisions behind the home-page video, kept free of React and the YouTube
 * API so they can be tested on their own. The component in
 * src/components/home-video.tsx owns the side effects.
 */

/** "Alpha Advert" on youtube.com/@alphaschoolstz. */
export const HOME_VIDEO_ID = "qoNGalen6Uk";

export type StartMode = "autoplay" | "tap-to-play";

/**
 * The hosts the player pulls from. The home page preconnects to them so the
 * DNS lookup and TLS handshake are done before the player is asked for; on a
 * slow mobile connection each of those costs up to a second.
 */
export const VIDEO_HOSTS = [
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
  "https://s.ytimg.com",
  "https://i.ytimg.com",
] as const;

/**
 * Whether the player is built while the reader is still at the top of the
 * page, rather than only when they scroll near the video.
 *
 * Measured on a 1.6 Mbps connection (2026-10-21): from reaching the section
 * to a moving picture took 5.6 s when nothing had loaded in advance, almost
 * all of it the player itself. Building it while the reader looks at the
 * hero hides nearly all of that wait. It costs about half a megabyte for a
 * reader who never scrolls this far, so a reader who asked for less data or
 * less motion still loads nothing until they tap play.
 */
export function preloadsPlayer(mode: StartMode): boolean {
  return mode === "autoplay";
}

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
 * How the first play is attempted. Browsers refuse to start a video with
 * sound unless the reader has tapped the page, and the component used to
 * find that out the slow way: ask for sound, wait 1.2 s, then retry muted.
 * Browsers that report user activation let it skip straight to the muted
 * start when no tap has happened; those that do not report it (`undefined`)
 * keep the old ask-then-retry path.
 */
export function firstPlay(hasBeenActive: boolean | undefined): "sound" | "muted" {
  return hasBeenActive === false ? "muted" : "sound";
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
