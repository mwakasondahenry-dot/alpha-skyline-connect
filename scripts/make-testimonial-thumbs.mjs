/**
 * Makes the small copy of every published story photo that does not have one.
 *
 *   node scripts/make-testimonial-thumbs.mjs          (dry run: lists what it would do)
 *   node scripts/make-testimonial-thumbs.mjs --write  (uploads the copies)
 *
 * The site loads `media/testimonials/small/story-<id>.webp` in place of the
 * full-size original (src/lib/testimonial-photo.ts). New approvals make their
 * copy in the admin; this covers photos approved before that existed. It only
 * adds files: originals are never changed or removed.
 *
 * Needs ALPHA_SUPABASE_URL_SERVER and ALPHA_SUPABASE_SERVICE_ROLE_KEY in
 * .env.local (the same values the server uses).
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "media";
const SMALL_EDGE = 320; // keep in step with SMALL_EDGE in src/lib/testimonial-photo.ts
const write = process.argv.includes("--write");

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const url = (env.ALPHA_SUPABASE_URL_SERVER ?? env.ALPHA_SUPABASE_URL)?.replace(
  /\/rest\/v1\/?$/,
  "",
);
const key = env.ALPHA_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing ALPHA_SUPABASE_URL_SERVER or ALPHA_SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const list = async (prefix) => {
  const { data, error } = await db.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error) throw error;
  return data.map((f) => f.name);
};

const originals = (await list("testimonials")).filter((n) => /^story-[^.]+\.[a-z0-9]+$/i.test(n));
const existing = new Set(await list("testimonials/small"));

let before = 0;
let after = 0;
for (const name of originals) {
  const stem = name.slice(0, name.lastIndexOf("."));
  const target = `${stem}.webp`;
  if (existing.has(target)) continue;

  const { data, error } = await db.storage.from(BUCKET).download(`testimonials/${name}`);
  if (error) {
    console.error(`skip ${name}: ${error.message}`);
    continue;
  }
  const input = Buffer.from(await data.arrayBuffer());
  const small = await sharp(input)
    .rotate() // honour the phone's orientation flag before it is stripped
    .resize(SMALL_EDGE, SMALL_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  before += input.length;
  after += small.length;
  console.log(
    `${name}  ${(input.length / 1024).toFixed(0)} KB -> ${(small.length / 1024).toFixed(0)} KB`,
  );

  if (write) {
    const { error: upError } = await db.storage
      .from(BUCKET)
      .upload(`testimonials/small/${target}`, small, { contentType: "image/webp", upsert: false });
    if (upError) console.error(`  upload failed: ${upError.message}`);
  }
}

console.log(
  `\n${write ? "Uploaded" : "Would upload"}: ${(before / 1048576).toFixed(1)} MB of originals -> ${(after / 1024).toFixed(0)} KB of small copies`,
);
if (!write) console.log("Dry run. Add --write to upload.");
