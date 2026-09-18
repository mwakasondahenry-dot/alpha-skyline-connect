/**
 * Server function for the story wizards: alumni (/alumni/story) and parents
 * (/parents/story), general and personal links.
 *
 * Everything a stranger sends arrives here and is treated as hostile. The
 * client is used for nothing but convenience: every limit is enforced again
 * on this side (validateStory / validateParentStory), and `published` is
 * written as a literal so no shape of request can set it.
 *
 * Schema: alpha_migration_alumni_submissions.sql,
 *         alpha_migration_testimonial_invites.sql,
 *         alpha_migration_parent_invites.sql
 */
import { createServerFn } from "@tanstack/react-start";
import { callerIp, serviceClient } from "@/lib/server/supabase-service";
import { sniffImage } from "@/lib/image-sniff";
import { formAudience, type Audience } from "@/lib/invites/audience";
import { hashCode } from "@/lib/invites/token";
import { PARENT_CONSENT_TEXT, validateParentStory } from "@/lib/story/parent-fields";
import {
  CONSENT_TEXT,
  PENDING_BUCKET,
  PHOTO_MAX_BYTES,
  StoryError,
  validateStory,
} from "@/lib/story/fields";

export { CONSENT_TEXT, MESSAGE_MAX, PHOTO_MAX_BYTES, PENDING_BUCKET } from "@/lib/story/fields";

/** General-link submissions allowed from one address per hour. */
const RATE_LIMIT = 5;
/**
 * Personal-invite-link submissions allowed from one address per hour.
 * Higher than the general link's limit because invite links are shared over
 * WhatsApp/SMS and several invited alumni behind the same shared mobile-
 * carrier IP (CGNAT) can legitimately submit within the same hour; the
 * 256-bit link code and the one-story-per-invite lock (submit_invited_story)
 * already bound how much abuse this can absorb. Owner-approved.
 */
const INVITE_RATE_LIMIT = 30;

function fail(message: string): never {
  throw new StoryError(message);
}

export type StorySubmissionResult = { ok: true } | { ok: false; state: "invalid" | "submitted" };

/** One shape for both audiences, matching the testimonials columns. */
type StoryRow = {
  audience: Audience;
  /** The exact wording this submitter agreed to. */
  consentText: string;
  code: string | null;
  schoolSlug: string;
  fullName: string;
  relationship: string;
  company: string | null;
  cityCountry: string | null;
  gradYear: number | null;
  answers: Partial<Record<string, string>> | null;
  quote: string;
};

/** Validates with the audience's own rules. Throws StoryError. */
function readStory(form: FormData): StoryRow {
  if (formAudience(form) === "parent") {
    const p = validateParentStory(form);
    return {
      audience: "parent",
      consentText: PARENT_CONSENT_TEXT,
      code: p.code,
      schoolSlug: p.schoolSlug,
      fullName: p.fullName,
      relationship: p.relationship,
      company: null,
      cityCountry: null,
      gradYear: null,
      answers: p.answers,
      quote: p.quote,
    };
  }
  const a = validateStory(form);
  return {
    audience: "alumni",
    consentText: CONSENT_TEXT,
    code: a.code,
    schoolSlug: a.schoolSlug,
    fullName: a.fullName,
    relationship: a.role,
    company: a.company,
    cityCountry: a.cityCountry,
    gradYear: a.gradYear,
    answers: a.answers,
    quote: a.quote,
  };
}

/**
 * The story wizard's submit, for both the general link and personal links.
 * A code in the form means a personal link: the story is written through
 * submit_invited_story, which locks the invite so it yields one story.
 */
export const submitStory = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Invalid submission.");
    return data;
  })
  .handler(async ({ data }): Promise<StorySubmissionResult> => {
    let sb: ReturnType<typeof serviceClient> | null = null;
    let pendingPath: string | null = null;

    const discardPhoto = async () => {
      if (!sb || !pendingPath) return;
      // Never let a discard failure escape and replace the caller's
      // user-facing error: a thrown (not returned) storage error here is
      // logged and swallowed, same as a returned one.
      try {
        const { error } = await sb.storage.from(PENDING_BUCKET).remove([pendingPath]);
        if (error) console.error("[submitStory] discard photo", error);
      } catch (err) {
        console.error("[submitStory] discard photo", err);
      }
      pendingPath = null;
    };

    try {
      const input = readStory(data);
      sb = serviceClient();
      const ip = callerIp();

      /* Rate limit before any storage write, so a flood costs the bucket nothing. */
      const { data: allowed, error: rateError } = await sb.rpc("claim_submission_slot", {
        p_key: `${input.code ? "invite" : input.audience}:${ip}`,
        p_limit: input.code ? INVITE_RATE_LIMIT : RATE_LIMIT,
      });
      if (rateError) {
        console.error("[submitStory] rate limit", rateError);
        fail("Could not accept your story right now. Please try again shortly.");
      }
      if (allowed === false) {
        fail("That is a few submissions in a short time. Please try again in an hour.");
      }

      /* Photo: optional, sniffed, size-checked, stored under our own name. */
      const photo = data.get("photo");
      if (photo instanceof File && photo.size > 0) {
        if (photo.size > PHOTO_MAX_BYTES) {
          fail("That photo is larger than 5 MB. Please choose a smaller one.");
        }
        const buffer = new Uint8Array(await photo.arrayBuffer());
        if (buffer.byteLength > PHOTO_MAX_BYTES) {
          fail("That photo is larger than 5 MB. Please choose a smaller one.");
        }
        const kind = sniffImage(buffer);
        if (!kind) fail("That file is not a JPEG, PNG or WebP image.");

        const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${kind.ext}`;
        const { error: uploadError } = await sb.storage
          .from(PENDING_BUCKET)
          .upload(path, buffer, { contentType: kind.mime, upsert: false });
        if (uploadError) {
          console.error("[submitStory] upload", uploadError);
          fail("Could not save your photo. Please try again without it.");
        }
        pendingPath = path;
      }

      const submittedIp = ip === "unknown" ? null : ip;

      if (input.code) {
        const { data: outcome, error } = await sb.rpc("submit_invited_story", {
          p_token_hash: await hashCode(input.code),
          p_audience: input.audience,
          p_author_name: input.fullName,
          p_school_slug: input.schoolSlug,
          p_grad_year: input.gradYear,
          p_relationship: input.relationship,
          p_company: input.company,
          p_city_country: input.cityCountry,
          p_answers: input.answers,
          p_quote: input.quote,
          p_pending_photo_path: pendingPath,
          p_consent_text: input.consentText,
          p_submitted_ip: submittedIp,
        });
        if (error) {
          console.error("[submitStory] invited insert", error);
          await discardPhoto();
          fail("Could not save your story. Please try again.");
        }
        if (outcome !== "ok") {
          await discardPhoto();
          return { ok: false, state: outcome === "submitted" ? "submitted" : "invalid" };
        }
        return { ok: true };
      }

      /* General link. published is a literal false; photo_url stays null
         until staff approve and the file is copied to the public bucket. */
      const { error } = await sb.from("testimonials").insert({
        school_slug: input.schoolSlug,
        author_name: input.fullName,
        relationship: input.relationship,
        company: input.company,
        city_country: input.cityCountry,
        grad_year: input.gradYear,
        quote: input.quote,
        answers: input.answers,
        photo_url: null,
        pending_photo_path: pendingPath,
        published: false,
        consent_at: new Date().toISOString(),
        consent_text: input.consentText,
        submitted_ip: submittedIp,
        sort_order: 0,
        invite_id: null,
      });
      if (error) {
        console.error("[submitStory] insert", error);
        await discardPhoto();
        fail("Could not save your story. Please try again.");
      }
      return { ok: true };
    } catch (err) {
      await discardPhoto();
      if (err instanceof StoryError) throw err;
      console.error("[submitStory]", err);
      throw new Error("Could not save your story. Please try again, or contact the school.");
    }
  });
