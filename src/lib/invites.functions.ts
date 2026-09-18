/**
 * Server functions for alumni testimonial invites.
 *
 * Staff functions take the admin session's access token and check it with
 * requireStaff before doing anything. openInvite is public; it reveals only
 * the invitee's own name and pre-fills, and does not tell an unknown code
 * from an expired one.
 *
 * Schema: alpha_migration_testimonial_invites.sql
 */
import { createServerFn } from "@tanstack/react-start";
import { serviceClient } from "@/lib/server/supabase-service";
import { requireStaff, StaffAuthError } from "@/lib/server/staff-guard";
import { inviteLinkKey, siteBase } from "@/lib/server/invite-env";
import { isAudience, type Audience } from "@/lib/invites/audience";
import {
  ALUMNI_SCHOOLS,
  MAX_CONTACTS,
  validateContact,
  type AlumniSchool,
  type InviteDraft,
} from "@/lib/invites/contacts";
import {
  CODE_PATTERN,
  decryptCode,
  encryptCode,
  hashCode,
  newLinkCode,
  storyPath,
} from "@/lib/invites/token";
import { inviteMessage, parentInviteMessage, whatsappUrl } from "@/lib/invites/whatsapp";

const INVITE_TTL_DAYS = 60;
const LOOKUP_CHUNK = 100;

/** Its message is shown to the member of staff. */
class InviteError extends Error {}

function expiry(): string {
  return new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

async function mintToken(key: string) {
  const code = newLinkCode();
  return {
    code,
    token_hash: await hashCode(code),
    token_cipher: await encryptCode(code, key),
  };
}

/** Staff-facing errors pass through; anything else is logged and replaced. */
async function guarded<T>(label: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof InviteError || err instanceof StaffAuthError) throw err;
    console.error(`[${label}]`, err);
    throw new Error("Something went wrong. Please try again.");
  }
}

export const getLinkBase = createServerFn({ method: "GET" }).handler(async () => {
  const base = siteBase();
  return { base, isLocal: /\/\/(localhost|127\.|192\.168\.|10\.)/.test(base) };
});

export type CreateInvitesResult = { created: number; skippedExisting: string[] };

export const createInvites = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; audience: Audience; rows: InviteDraft[] }) => data)
  .handler(({ data }) =>
    guarded("createInvites", async (): Promise<CreateInvitesResult> => {
      const { userId } = await requireStaff(data.accessToken);
      if (!isAudience(data.audience)) throw new InviteError("Choose who you are inviting.");
      const audience = data.audience;

      const rows = Array.isArray(data.rows) ? data.rows : [];
      if (rows.length === 0) throw new InviteError("There is nobody to invite.");
      if (rows.length > MAX_CONTACTS) {
        throw new InviteError(`Up to ${MAX_CONTACTS} people at a time.`);
      }

      /* Validate everything before writing anything: all or nothing. */
      const clean: InviteDraft[] = [];
      const seen = new Set<string>();
      for (const r of rows) {
        const result = validateContact({
          name: String(r?.fullName ?? ""),
          phone: String(r?.phone ?? ""),
          email: String(r?.email ?? ""),
          school: String(r?.schoolSlug ?? ""),
          year: audience === "parent" || r?.gradYear == null ? "" : String(r.gradYear),
        });
        if (!result.ok) {
          throw new InviteError(
            `${String(r?.fullName ?? "A row")}: ${result.reason} Nothing was imported.`,
          );
        }
        if (seen.has(result.draft.phone)) continue;
        seen.add(result.draft.phone);
        clean.push(result.draft);
      }

      const sb = serviceClient();
      const taken = new Set<string>();
      for (let i = 0; i < clean.length; i += LOOKUP_CHUNK) {
        const phones = clean.slice(i, i + LOOKUP_CHUNK).map((c) => c.phone);
        const { data: existing, error } = await sb
          .from("testimonial_invites")
          .select("phone")
          .eq("audience", audience)
          .in("phone", phones);
        if (error) throw error;
        for (const e of (existing ?? []) as { phone: string }[]) taken.add(e.phone);
      }

      const fresh = clean.filter((c) => !taken.has(c.phone));
      const key = inviteLinkKey();
      const expires_at = expiry();
      const inserts = await Promise.all(
        fresh.map(async (c) => {
          const { token_hash, token_cipher } = await mintToken(key);
          return {
            full_name: c.fullName,
            phone: c.phone,
            audience,
            email: c.email,
            school_slug: c.schoolSlug,
            grad_year: c.gradYear,
            token_hash,
            token_cipher,
            status: "pending",
            expires_at,
            created_by: userId,
          };
        }),
      );

      if (inserts.length > 0) {
        const { error } = await sb.from("testimonial_invites").insert(inserts);
        if (error) {
          if (error.code === "23505") {
            throw new InviteError(
              "Someone on this list was invited a moment ago. Check the list and try again.",
            );
          }
          throw error;
        }
      }

      return {
        created: inserts.length,
        skippedExisting: clean.filter((c) => taken.has(c.phone)).map((c) => c.fullName),
      };
    }),
  );

type InviteRef = { accessToken: string; inviteId: string };

export const getInviteLink = createServerFn({ method: "POST" })
  .inputValidator((data: InviteRef) => data)
  .handler(({ data }) =>
    guarded("getInviteLink", async () => {
      await requireStaff(data.accessToken);
      const sb = serviceClient();
      const { data: row, error } = await sb
        .from("testimonial_invites")
        .select("id,full_name,phone,status,expires_at,token_cipher,audience")
        .eq("id", data.inviteId)
        .maybeSingle();
      if (error) throw error;
      if (!row) throw new InviteError("That invite no longer exists.");
      if (row.status === "submitted") {
        throw new InviteError("This person has already sent their story.");
      }
      if (new Date(row.expires_at).getTime() < Date.now()) {
        throw new InviteError("This link has expired. Use Regenerate to make a new one.");
      }

      let code: string;
      try {
        code = await decryptCode(row.token_cipher, inviteLinkKey());
      } catch (err) {
        console.error("[getInviteLink] decrypt", err);
        throw new InviteError(
          "This link can't be shown any more. Use Regenerate to make a new one.",
        );
      }

      const audience: Audience = row.audience === "parent" ? "parent" : "alumni";
      const link = `${siteBase()}${storyPath(code, audience)}`;
      const { error: stampError } = await sb
        .from("testimonial_invites")
        .update({ last_shared_at: new Date().toISOString() })
        .eq("id", row.id);
      if (stampError) console.error("[getInviteLink] stamp", stampError);

      const message =
        audience === "parent" ? parentInviteMessage(row.full_name, link) : inviteMessage(row.full_name, link);
      return { link, whatsapp: whatsappUrl(row.phone, message) };
    }),
  );

export const regenerateInvite = createServerFn({ method: "POST" })
  .inputValidator((data: InviteRef) => data)
  .handler(({ data }) =>
    guarded("regenerateInvite", async () => {
      await requireStaff(data.accessToken);
      const sb = serviceClient();
      const { data: row, error } = await sb
        .from("testimonial_invites")
        .select("id,status")
        .eq("id", data.inviteId)
        .maybeSingle();
      if (error) throw error;
      if (!row) throw new InviteError("That invite no longer exists.");
      if (row.status === "submitted") {
        throw new InviteError("This person has already sent their story.");
      }

      const { token_hash, token_cipher } = await mintToken(inviteLinkKey());
      const { error: updateError } = await sb
        .from("testimonial_invites")
        .update({
          token_hash,
          token_cipher,
          expires_at: expiry(),
          status: "pending",
          opened_at: null,
        })
        .eq("id", row.id)
        .neq("status", "submitted");
      if (updateError) throw updateError;
      return { ok: true as const };
    }),
  );

export type OpenInviteResult =
  | { state: "ok"; fullName: string; schoolSlug: AlumniSchool | null; gradYear: number | null }
  | { state: "submitted" }
  | { state: "invalid" };

/**
 * Called from the browser after the page loads, not from a route loader, so
 * WhatsApp's link-preview fetch (which runs no JavaScript) does not mark an
 * invite as opened.
 */
export const openInvite = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; audience: Audience }) => data)
  .handler(async ({ data }): Promise<OpenInviteResult> => {
    try {
      const code = typeof data?.code === "string" ? data.code : "";
      if (!CODE_PATTERN.test(code)) return { state: "invalid" };

      const sb = serviceClient();
      const { data: row, error } = await sb
        .from("testimonial_invites")
        .select("id,full_name,school_slug,grad_year,status,expires_at,audience")
        .eq("token_hash", await hashCode(code))
        .maybeSingle();
      if (error) throw error;
      const audience = isAudience(data?.audience) ? data.audience : "alumni";
      if (!row || row.audience !== audience || new Date(row.expires_at).getTime() < Date.now()) {
        return { state: "invalid" };
      }
      if (row.status === "submitted") return { state: "submitted" };

      if (row.status === "pending") {
        const { error: openError } = await sb
          .from("testimonial_invites")
          .update({ status: "opened", opened_at: new Date().toISOString() })
          .eq("id", row.id)
          .eq("status", "pending");
        if (openError) console.error("[openInvite] mark opened", openError);
      }

      const school = ALUMNI_SCHOOLS.find((s) => s.value === row.school_slug)?.value ?? null;
      return {
        state: "ok",
        fullName: row.full_name,
        schoolSlug: school,
        gradYear: audience === "parent" ? null : row.grad_year,
      };
    } catch (err) {
      console.error("[openInvite]", err);
      throw new Error("We couldn't load your invitation. Please try again shortly.");
    }
  });
