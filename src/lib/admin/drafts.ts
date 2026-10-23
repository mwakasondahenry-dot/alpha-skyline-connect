export function draftKey(route: string, id: string): string {
  return `alpha-admin-draft:${route}:${id}`;
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
