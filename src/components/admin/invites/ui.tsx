/** Shared admin pieces for the invite panel. */
import { useAdminAuth } from "@/lib/admin-auth";

export const A_INPUT =
  "w-full rounded-lg border border-[var(--color-deep-blue)]/20 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30";

export const A_CARD = "rounded-xl border border-[var(--color-deep-blue)]/10 bg-white p-4 shadow-sm";

export const A_BTN_PRIMARY =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-md bg-[var(--color-gold)] px-4 " +
  "text-sm font-semibold text-[var(--color-accent-foreground)] shadow-sm hover:bg-[var(--color-gold-dark)] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const A_BTN_SECONDARY =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-md border " +
  "border-[var(--color-deep-blue)]/20 bg-white px-3 text-sm font-semibold text-[var(--color-deep-blue)] " +
  "hover:bg-[var(--color-deep-blue)]/5 disabled:cursor-not-allowed disabled:opacity-50";

export type NoticeState = { tone: "ok" | "error"; text: string } | null;

export function Notice({ notice }: { notice: NoticeState }) {
  if (!notice) return null;
  return notice.tone === "error" ? (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 break-words">
      {notice.text}
    </div>
  ) : (
    <div
      role="status"
      className="rounded-lg border border-[var(--color-bright-blue)]/30 bg-[var(--color-bright-blue)]/5 px-3 py-2 text-sm text-[var(--color-deep-blue)] break-words"
    >
      {notice.text}
    </div>
  );
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** The signed-in admin's Supabase access token, for staff server functions. */
export function useAccessToken(): string {
  return useAdminAuth().session?.access_token ?? "";
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
