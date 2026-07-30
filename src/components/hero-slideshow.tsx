// Lightweight hero slideshow: cross-fades through Supabase-managed slides,
// falling back to the page's built-in hero image until real photos are added.
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHeroSlides } from "@/lib/alpha-content.functions";

export type HeroImage = { src: string; alt: string };

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function HeroSlideshow({
  pageKey,
  fallback,
  className = "",
  imgClassName = "",
  imgStyle,
  interval = 6000,
  showDots = true,
}: {
  /** Matches hero_slides.page_key in the database. */
  pageKey: string;
  fallback: HeroImage[];
  className?: string;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
  interval?: number;
  showDots?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const { data } = useQuery({
    queryKey: ["hero-slides", pageKey],
    queryFn: () => getHeroSlides({ data: { page: pageKey } }),
    staleTime: 5 * 60 * 1000,
  });

  const images: HeroImage[] = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((s) => ({ src: s.image_url, alt: s.alt_text ?? "" }));
    }
    return fallback;
  }, [data, fallback]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  useEffect(() => {
    setIdx(0);
  }, [count]);

  useEffect(() => {
    if (reduced || paused || count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), interval);
    return () => clearInterval(t);
  }, [reduced, paused, count, interval]);

  return (
    <div
      className={`absolute inset-0 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        touchX.current = null;
        if (start == null || end == null || count <= 1) return;
        const dx = end - start;
        if (Math.abs(dx) < 40) return;
        setIdx((i) => (dx < 0 ? (i + 1) % count : (i - 1 + count) % count));
      }}
    >
      {images.map((img, i) => (
        <img
          key={`${img.src}-${i}`}
          src={img.src}
          alt={i === idx ? img.alt : ""}
          aria-hidden={i !== idx}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={i === 0 ? "high" : "auto"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
            i === idx ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
          style={imgStyle}
        />
      ))}

      {showDots && count > 1 && (
        <div className="absolute bottom-5 right-5 z-20 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show hero image ${i + 1}`}
              aria-current={i === idx}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 motion-reduce:transition-none ${
                i === idx ? "w-8 bg-[var(--color-gold)]" : "w-1.5 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
