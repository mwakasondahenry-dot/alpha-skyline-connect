import { normalizeTzPhone } from "@/lib/invites/phone";
import { firstName, whatsappUrl } from "@/lib/invites/whatsapp";

const TZ = "Africa/Dar_es_Salaam";

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dayMonthFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
});
const fullFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Calendar day in Dar es Salaam as a UTC-midnight day number, so days subtract cleanly. */
function dayNumber(d: Date): number {
  const [y, m, day] = dayKey.format(d).split("-").map(Number);
  return Date.UTC(y, m - 1, day) / 86_400_000;
}

export function formatAdminDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = dayNumber(now) - dayNumber(d);
  if (diff === 0) return `Today ${timeFmt.format(d)}`;
  if (diff === 1) return `Yesterday ${timeFmt.format(d)}`;
  const sameYear = dayKey.format(d).slice(0, 4) === dayKey.format(now).slice(0, 4);
  return (sameYear ? dayMonthFmt : fullFmt).format(d);
}

/** The exact moment, for a detail screen: "18 Oct 2026, 17:02" in Dar es Salaam. */
export function formatAdminDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${fullFmt.format(d)}, ${timeFmt.format(d)}`;
}

export function schoolLabel(slug: string | null | undefined): string {
  switch (slug) {
    case null:
    case undefined:
    case "group-wide":
      return "Alpha Schools";
    case "nursery-primary":
      return "Nursery & Primary";
    case "alpha-high":
      return "Alpha High";
    case "alpha-girls":
      return "Alpha Girls";
    default:
      return "Not recorded";
  }
}

export type ContactLinks = {
  whatsapp: string | null;
  tel: string | null;
  mailto: string | null;
};

export function contactLinks(p: {
  phone?: string | null;
  email?: string | null;
  name?: string;
  subject?: string | null;
}): ContactLinks {
  let whatsapp: string | null = null;
  let tel: string | null = null;
  if (p.phone) {
    const r = normalizeTzPhone(p.phone);
    if (r.ok) {
      const greeting = p.name?.trim() ? `Hello ${firstName(p.name)},` : "Hello,";
      whatsapp = whatsappUrl(r.phone, greeting);
      tel = `tel:${r.phone}`;
    }
  }
  let mailto: string | null = null;
  const email = p.email?.trim();
  if (email) {
    mailto = `mailto:${email}`;
    if (p.subject) mailto += `?subject=${encodeURIComponent(`Re: ${p.subject}`)}`;
  }
  return { whatsapp, tel, mailto };
}
