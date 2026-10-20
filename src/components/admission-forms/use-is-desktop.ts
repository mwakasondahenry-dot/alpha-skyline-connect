/**
 * Whether this is a computer with a mouse and a wide screen: the only place
 * the online form is offered. Phones and tablets get the blank form instead.
 * null until mounted, because the page is server-rendered and the server
 * cannot know.
 */
import { useEffect, useState } from "react";

export const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

export function useIsDesktop(): boolean | null {
  const [desktop, setDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setDesktop(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return desktop;
}
