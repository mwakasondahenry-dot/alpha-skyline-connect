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
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/alpha-supabase/types";

/** The exact wording a submitter agrees to. Stored with every submission. */
export const CONSENT_TEXT =
  "I agree that Alpha Schools may publish my name, message and photo on its " +
  "public website. I understand I can request removal at any time by " +
  "contacting the school.";

export const MESSAGE_MAX = 400;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PENDING_BUCKET = "alumni-pending";

/** Submissions allowed from one address per hour. */
const RATE_LIMIT = 5;

/**
 * Accepted image types, keyed by the magic bytes that actually identify them.
 *
 * The browser-supplied Content-Type is a claim, not evidence — it is trivially
 * forged and is never consulted. The extension written to storage is derived
 * from whichever signature matches here, so a .png holding a script is stored
 * as whatever it really is, or rejected.
 */
const SIGNATURES: ReadonlyArray<{
  ext: string;
  mime: string;
  match: (b: Uint8Array) => boolean;
}> = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    match: (b) =>
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: "webp",
    mime: "image/webp",
    // "RIFF" .... "WEBP"
    match: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

function sniffImage(bytes: Uint8Array) {
  return SIGNATURES.find((s) => s.match(bytes)) ?? null;
}

/**
 * Service-role client. Bypasses RLS, so it exists only inside this module and
 * is never handed to a route. It is what lets the alumni-pending bucket carry
 * no anonymous policy at all: the sole path a byte can take into that bucket
 * runs through the validation below.
 */
function serviceClient() {
  const rawUrl = process.env.ALPHA_SUPABASE_URL_SERVER ?? process.env.ALPHA_SUPABASE_URL;
  const key = process.env.ALPHA_SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) {
    throw new Error("ALPHA_SUPABASE_SERVICE_ROLE_KEY / ALPHA_SUPABASE_URL_SERVER not configured");
  }
  const url = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Caller's address, for rate limiting.
 *
 * cf-connecting-ip first: this deploys behind Cloudflare, which sets it and
 * strips any client-supplied copy, so it cannot be spoofed. x-forwarded-for is
 * the fallback and is only as trustworthy as the proxy in front — it is used
 * for the limit, never for anything security-bearing.
 */
function callerIp(): string {
  return getRequestHeader("cf-connecting-ip") ?? getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export type AlumniSubmissionResult = { ok: true };

/**
 * A message intended for the person filling in the form.
 *
 * Everything thrown from a server function reaches the browser, so the
 * distinction matters: only these are shown. Anything else — a missing
 * environment variable, a Postgres error, a storage failure — is logged here
 * and replaced with a generic line, because the alternative is a public form
 * telling a stranger which environment variables the server is missing.
 */
class SubmissionError extends Error {}

function fail(message: string): never {
  throw new SubmissionError(message);
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
