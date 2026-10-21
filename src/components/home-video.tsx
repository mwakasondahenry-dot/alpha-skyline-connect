/**
 * Full-screen YouTube section on the home page.
 *
 * design/README.md used to forbid autoplay outright; this is the agreed
 * exception, and every limit on it exists for the same audience — parents on
 * mid-range Android phones on mobile data:
 *
 *   - Only the poster loads with the page itself. The YouTube player (~1 MB
 *     of script) is built once the page is interactive and the browser has a
 *     quiet moment, or when the section comes within a screen, whichever is
 *     first, so it is ready before the reader scrolls down (preloadsPlayer).
 *   - It plays only while at least half of it is on screen, and pauses when
 *     scrolled past.
 *   - Reduced motion or Data Saver: no autoplay and no player until the
 *     reader taps play.
 *
 * Sound. Browsers refuse to start a video with sound unless the reader has
 * tapped the page — scrolling does not count, and iOS refuses regardless.
 * So the first play asks for sound, and if the browser has not let the video
 * start within a moment it retries muted and offers "Tap for sound".
 *
 * The video is cropped to cover the screen, like the hero photograph. On a
 * portrait phone that shows roughly the middle third of each frame — chosen
 * deliberately over letterboxing. YouTube's own controls are hidden and the
 * iframe ignores pointer events, so a swipe over the video scrolls the page
 * instead of being swallowed by the player.
 */
import { useEffect, useRef, useState } from "react";
import poster from "@/assets/home-video-poster.webp";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import {
  HOME_VIDEO_ID,
  embedSrc,
  firstPlay,
  preloadsPlayer,
  shouldPlay,
  startMode,
  type StartMode,
} from "@/lib/home-video";
import { T } from "@/components/type-roles";

/** home-video-poster.webp at 24×14, for the instant blurred placeholder. */
const POSTER_PLACEHOLDER =
  "data:image/webp;base64,UklGRgIBAABXRUJQVlA4IPYAAABwBQCdASoYAA4APtFUo0uoJKMhsAgBABoJbACdFQAo5L9gPhErABslixzDvHt/GAgpsmGAAP5Mfvjl1Jp8/AOM0G+Is2YJDRsG+juEX63sohUlCtLkZLTTFptjirvhZTsaiqLKwy2pdVhB3zk8CMbK2smaRNUbgvzZfI6e9SVQjP850k9kWf9JI2q6qwngJ9THfAR3Z/yDzzXvHxSnZzslysWZen4DADf8pGTzsHl3rxMLefKJi7yCKNeExcJmrgjqGuENu52TbC+mPw9tvv5aeZe+MhO10cLs+Ra6f3uAeGoqrLvfhYhyOvbzq9n2i6WVnx6gAAA=";

/* The slice of the IFrame API this component uses. */
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getPlayerState(): number;
  destroy(): void;
}
interface YTNamespace {
  Player: new (
    el: HTMLIFrameElement,
    opts: { events: { onReady?: () => void; onStateChange?: (e: { data: number }) => void } },
  ) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYING = 1;
/* How long a play-with-sound attempt gets before it is treated as blocked. */
const SOUND_GRACE_MS = 1200;

let apiPromise: Promise<YTNamespace> | null = null;

/* One script tag, however many times this mounts across navigations. */
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT!);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

export function HomeVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const triedSound = useRef(false);
  const wantPlayRef = useRef(false);

  /* null until mounted: the server render is the still alone. */
  const [mode, setMode] = useState<StartMode | null>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(false);
  const [muted, setMuted] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [userStarted, setUserStarted] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    );
    setMode(startMode({ reducedMotion, saveData }));
    setOrigin(window.location.origin);
  }, []);

  /* Two observers on the one element: a wide one that decides when the
     player is worth loading, and a half-visible one that drives playback. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const nearObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          nearObs.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const viewObs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.5,
    });
    nearObs.observe(el);
    viewObs.observe(el);
    return () => {
      nearObs.disconnect();
      viewObs.disconnect();
    };
  }, []);

  /* Build the player early, as soon as the page is interactive and the
     browser has a quiet moment, so it is ready by the time the reader
     scrolls down to it. Not after the load event: on a slow connection that
     fires only once every image is in, which is too late to help. The
     observer above still covers a reader who gets there first. */
  useEffect(() => {
    if (mode === null || !preloadsPlayer(mode)) return;
    const start = () => setNear(true);
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(idle);
    }
    const timer = window.setTimeout(start, 1000);
    return () => window.clearTimeout(timer);
  }, [mode]);

  const loadPlayer = mode === "autoplay" ? near : userStarted;

  useEffect(() => {
    if (!loadPlayer || !origin || !iframeRef.current) return;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;
      playerRef.current = new YT.Player(iframeRef.current, {
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            const isPlaying = e.data === PLAYING;
            setPlaying(isPlaying);
            if (isPlaying) {
              setShown(true);
              setMuted(playerRef.current?.isMuted() ?? false);
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [loadPlayer, origin]);

  const wantPlay = mode !== null && shouldPlay({ mode, inView, userPaused, userStarted });

  wantPlayRef.current = wantPlay;

  useEffect(() => {
    const p = playerRef.current;
    if (!ready || !p) return;
    if (!wantPlay) {
      p.pauseVideo();
      return;
    }
    if (triedSound.current) {
      p.playVideo();
      return;
    }
    triedSound.current = true;
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
      .userActivation;
    if (firstPlay(activation?.hasBeenActive) === "muted") {
      /* No tap yet, so the browser would refuse sound: start muted at once
         instead of finding that out over the grace period. */
      p.mute();
      p.playVideo();
      return;
    }
    p.unMute();
    p.playVideo();
    /* Not cleared when wantPlay flips: if the reader scrolls away inside the
       grace period, the fallback still mutes so the next resume can start. */
    window.setTimeout(() => {
      if (playerRef.current !== p || p.getPlayerState() === PLAYING) return;
      p.mute();
      if (wantPlayRef.current) p.playVideo();
    }, SOUND_GRACE_MS);
  }, [ready, wantPlay]);

  const toggleSound = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
      setUserPaused(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const togglePlay = () => {
    if (mode === "tap-to-play" && !userStarted) {
      setUserStarted(true);
      setUserPaused(false);
      return;
    }
    setUserPaused(wantPlay);
  };

  const awaitingTap = mode === "tap-to-play" && !userStarted;
  const controlClass =
    "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-transform duration-200 active:scale-[0.97] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

  return (
    /* The attribute form of Reveal (src/components/reveal.tsx), because the
       observers need a ref on this element: a fade with no travel. */
    <section
      ref={sectionRef}
      suppressHydrationWarning
      data-reveal="none"
      aria-label="Alpha Schools video"
      className="relative isolate mb-[var(--space-section-y)] h-[100svh] min-h-[28rem] overflow-hidden bg-[var(--video-bg)]"
      style={{ containerType: "size" }}
    >
      {/* The video's poster, served from this site rather than YouTube's
          image host, over a tiny blurred copy inlined in the page. On slow
          mobile data the section showed as a full screen of dark navy until
          the poster arrived; the blurred copy is there from the first paint. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30 scale-110 bg-cover bg-center blur-xl"
        style={{ backgroundImage: `url(${POSTER_PLACEHOLDER})` }}
      />
      <img
        src={poster}
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {loadPlayer && origin && (
        <div
          aria-hidden
          className={`home-video-frame pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 ${shown ? "is-shown" : ""}`}
        >
          <iframe
            ref={iframeRef}
            src={embedSrc(HOME_VIDEO_ID, origin)}
            title="Alpha Advert"
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        </div>
      )}

      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "var(--video-scrim)" }}
      />

      {awaitingTap && (
        <button
          type="button"
          onClick={togglePlay}
          className={`${controlClass} absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]`}
          aria-label="Play video with sound"
        >
          <Play className="ml-1 h-8 w-8" aria-hidden />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 px-[var(--container-gutter)] pb-[var(--space-section-y)]">
        <div>
          <h2 className="font-display tracking-tight text-[var(--color-surface)]" style={T.section}>
            See Alpha in action
          </h2>
          <a
            href={`https://www.youtube.com/watch?v=${HOME_VIDEO_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[var(--color-surface)] underline underline-offset-4 opacity-90 hover:opacity-100"
            style={T.body}
          >
            Watch on YouTube
          </a>
        </div>

        {ready && !awaitingTap && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              className={`${controlClass} ${
                muted
                  ? "bg-[var(--btn-primary-bg)] px-5 py-3 text-[var(--btn-primary-fg)]"
                  : "h-12 w-12 bg-[var(--video-control-bg)] text-[var(--color-surface)]"
              }`}
              style={muted ? T.body : undefined}
              aria-label={muted ? "Turn sound on" : "Mute video"}
            >
              {muted ? (
                <>
                  <VolumeX className="h-5 w-5" aria-hidden />
                  Tap for sound
                </>
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className={`${controlClass} h-12 w-12 bg-[var(--video-control-bg)] text-[var(--color-surface)]`}
              aria-label={playing ? "Pause video" : "Play video"}
            >
              {playing ? (
                <Pause className="h-5 w-5" aria-hidden />
              ) : (
                <Play className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
