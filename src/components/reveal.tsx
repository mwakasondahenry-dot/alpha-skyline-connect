import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type RevealDirection = "up" | "left" | "right" | "none";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useScrollReveal<T extends Element = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

const HIDDEN: Record<RevealDirection, string> = {
  up: "translate3d(0, 24px, 0)",
  left: "translate3d(-32px, 0, 0)",
  right: "translate3d(32px, 0, 0)",
  none: "none",
};

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const { ref, visible } = useScrollReveal<HTMLElement>();

  const shown = reduced || visible;
  const mergedStyle: CSSProperties = reduced
    ? { ...style }
    : {
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : HIDDEN[direction],
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: shown ? undefined : "opacity, transform",
        ...style,
      };

  const Component = Tag as React.ElementType;
  return (
    <Component ref={ref} className={className} style={mergedStyle}>
      {children}
    </Component>
  );
}
