const DRAFT_PREFIX = "alpha-admin-draft:";

export function draftKey(route: string, id: string): string {
  return `${DRAFT_PREFIX}${route}:${id}`;
}

export function saveDraft<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: drafts are a convenience only */
  }
}

export function readDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Forget every admin draft. Called on a deliberate sign-out only, so the next
 * person on a shared phone does not inherit unsaved edits. An expired sign-in
 * keeps them: that is what drafts are for.
 */
export function clearAllDrafts(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(DRAFT_PREFIX)) keys.push(k);
    }
    for (const k of keys) sessionStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

export function loginRedirect(pathname: string): string {
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return "/admin/login";
  return `/admin/login?redirect=${encodeURIComponent(pathname)}`;
}

export function safeRedirect(param: string | null | undefined): string {
  if (param && param.startsWith("/admin/") && !param.includes("//") && !param.includes("\\")) {
    return param;
  }
  return "/admin";
}
