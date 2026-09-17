/**
 * Server functions for the alumni submission flow.
 *
 * Everything a stranger sends arrives here and is treated as hostile. The
 * client is used for nothing but convenience: every limit below is enforced
 * again on this side, and `published` is written as a literal so no shape of
 * request can set it.
 *
 * Schema, RLS and the private bucket: alpha_migration_alumni_submissions.sql
 */
import { createServerFn } from "@tanstack/react-start";
import { callerIp, serviceClient } from "@/lib/server/supabase-service";
import { sniffImage } from "@/lib/image-sniff";
import { hashCode } from "@/lib/invites/token";
import {
  CONSENT_TEXT,
  MESSAGE_MAX,
  PENDING_BUCKET,
  PHOTO_MAX_BYTES,
  StoryError,
  validateStory,
} from "@/lib/story/fields";

export { CONSENT_TEXT, MESSAGE_MAX, PHOTO_MAX_BYTES, PENDING_BUCKET } from "@/lib/story/fields";

/** Submissions allowed from one address per hour. */
const RATE_LIMIT = 5;

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export type AlumniSubmissionResult = { ok: true };

/**
 * A message intended for the person filling in the form. Everything thrown
 * from a server function reaches the browser, so only these are shown; any
 * other error is logged and replaced with a generic line.
 */
const SubmissionError = StoryError;

function fail(message: string): never {
  throw new StoryError(message);
}

export const submitAlumniStory = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Invalid submission.");
    return data;
  })
  .handler(async ({ data }): Promise<AlumniSubmissionResult> => {
    try {
      const fullName = str(data, "full_name");
      const gradYearRaw = str(data, "grad_year");
      const role = str(data, "role");
      const company = str(data, "company");
      const message = str(data, "message");
      const consent = str(data, "consent");

      /* ---- Field validation ------------------------------------------- */
      if (!fullName) fail("Please enter your full name.");
      if (fullName.length > 120) fail("That name is too long.");

      const gradYear = Number.parseInt(gradYearRaw, 10);
      const thisYear = new Date().getFullYear();
      if (!Number.isInteger(gradYear) || gradYear < 1960 || gradYear > thisYear + 1) {
        fail("Please enter the year you finished, e.g. 2018.");
      }

      if (!message) fail("Please write a short message.");
      if (message.length > MESSAGE_MAX) {
        fail(`Please keep your message under ${MESSAGE_MAX} characters.`);
      }
      if (role.length > 120) fail("That role is too long.");
      if (company.length > 120) fail("That company name is too long.");

      /* Consent is the reason the rest of this is publishable at all. */
      if (consent !== "yes") {
        fail("Please agree to the consent statement to submit.");
      }

      /* ---- Rate limit --------------------------------------------------
       Before any storage write, so a flood costs the bucket nothing. */
      const sb = serviceClient();
      const ip = callerIp();

      const { data: allowed, error: rateError } = await sb.rpc(
        "claim_submission_slot" as never,
        { p_key: `alumni:${ip}`, p_limit: RATE_LIMIT } as never,
      );
      if (rateError) {
        console.error("[submitAlumniStory] rate limit", rateError);
        fail("Could not accept your story right now. Please try again shortly.");
      }
      if (allowed === false) {
        fail("That is a few submissions in a short time. Please try again in an hour.");
      }

      /* ---- Photo -------------------------------------------------------
       Optional. Sniffed, size-checked, and stored under a name of our
       choosing in the private bucket. The submitted filename is discarded
       entirely rather than sanitised. */
      let pendingPath: string | null = null;
      const photo = data.get("photo");

      if (photo instanceof File && photo.size > 0) {
        if (photo.size > PHOTO_MAX_BYTES) {
          fail("That photo is larger than 5 MB. Please choose a smaller one.");
        }

        const buffer = new Uint8Array(await photo.arrayBuffer());
        /* Re-check after reading: size is a claim until the bytes are counted. */
        if (buffer.byteLength > PHOTO_MAX_BYTES) {
          fail("That photo is larger than 5 MB. Please choose a smaller one.");
        }

        const kind = sniffImage(buffer);
        if (!kind) {
          fail("That file is not a JPEG, PNG or WebP image.");
        }

        pendingPath = `${new Date().getFullYear()}/${crypto.randomUUID()}.${kind.ext}`;

        const { error: uploadError } = await sb.storage
          .from(PENDING_BUCKET)
          .upload(pendingPath, buffer, {
            contentType: kind.mime,
            upsert: false,
          });

        if (uploadError) {
          console.error("[submitAlumniStory] upload", uploadError);
          fail("Could not save your photo. Please try again without it.");
        }
      }

      /* ---- Insert ------------------------------------------------------
       published is a literal false. There is no code path, and no request
       shape, that can make it anything else. photo_url stays null until a
       member of staff approves and the file is copied into the public
       bucket. */
      const row = {
        school_slug: "group-wide",
        author_name: fullName,
        relationship: role || null,
        company: company || null,
        grad_year: gradYear,
        quote: message,
        photo_url: null,
        pending_photo_path: pendingPath,
        published: false,
        consent_at: new Date().toISOString(),
        consent_text: CONSENT_TEXT,
        submitted_ip: ip === "unknown" ? null : ip,
        sort_order: 0,
      };

      const { error } = await (
        sb.from("testimonials") as unknown as {
          insert: (v: typeof row) => Promise<{ error: { message: string } | null }>;
        }
      ).insert(row);

      if (error) {
        console.error("[submitAlumniStory] insert", error);
        /* Do not orphan the photo if the row failed to land. */
        if (pendingPath) {
          await sb.storage.from(PENDING_BUCKET).remove([pendingPath]);
        }
        fail("Could not save your story. Please try again.");
      }

      return { ok: true };
    } catch (err) {
      if (err instanceof SubmissionError) throw err;
      /* Misconfiguration, a database error, a storage outage. The submitter can
       do nothing with any of it, and some of it should not leave the server. */
      console.error("[submitAlumniStory]", err);
      throw new Error("Could not save your story. Please try again, or contact the school.");
    }
  });

export type StorySubmissionResult = { ok: true } | { ok: false; state: "invalid" | "submitted" };

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
      const { error } = await sb.storage.from(PENDING_BUCKET).remove([pendingPath]);
      if (error) console.error("[submitStory] discard photo", error);
      pendingPath = null;
    };

    try {
      const input = validateStory(data);
      sb = serviceClient();
      const ip = callerIp();

      /* Rate limit before any storage write, so a flood costs the bucket nothing. */
      const { data: allowed, error: rateError } = await sb.rpc("claim_submission_slot", {
        p_key: `${input.code ? "invite" : "alumni"}:${ip}`,
        p_limit: RATE_LIMIT,
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
          p_author_name: input.fullName,
          p_school_slug: input.schoolSlug,
          p_grad_year: input.gradYear,
          p_relationship: input.role,
          p_company: input.company,
          p_city_country: input.cityCountry,
          p_answers: input.answers,
          p_quote: input.quote,
          p_pending_photo_path: pendingPath,
          p_consent_text: CONSENT_TEXT,
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
        relationship: input.role,
        company: input.company,
        city_country: input.cityCountry,
        grad_year: input.gradYear,
        quote: input.quote,
        answers: input.answers,
        photo_url: null,
        pending_photo_path: pendingPath,
        published: false,
        consent_at: new Date().toISOString(),
        consent_text: CONSENT_TEXT,
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
