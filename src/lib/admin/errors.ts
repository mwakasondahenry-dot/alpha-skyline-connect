const EXPIRED = "Your sign-in has expired. Sign in again and your changes will be kept.";

export function friendlyError(err: unknown): string {
  const e = (err && typeof err === "object" ? err : {}) as {
    message?: unknown;
    code?: unknown;
    kind?: unknown;
    what?: unknown;
  };
  const message = typeof e.message === "string" ? e.message : "";
  const code = typeof e.code === "string" ? e.code : "";

  if (e.kind === "conflict") {
    // `what` names the thing ("message"); the Stories screens leave it out.
    const what = typeof e.what === "string" && e.what ? e.what : "story";
    return `This ${what} was changed by someone else. It has been refreshed.`;
  }
  if (code === "PGRST301" || /jwt expired/i.test(message)) return EXPIRED;
  if (err instanceof TypeError && /failed to fetch|network/i.test(message)) {
    return "No internet connection. Nothing was saved.";
  }
  if (code === "42501" || /row-level security/i.test(message)) {
    return "You do not have permission to do that.";
  }
  if (code === "23514") {
    return "One of the values is not allowed. Check the form and try again.";
  }
  if (/object not found/i.test(message)) {
    return "The photo could not be found. It may have been removed.";
  }
  return "Something went wrong. Nothing was changed. Try again.";
}
