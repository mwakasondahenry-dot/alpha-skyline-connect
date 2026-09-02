# Alpha Schools Launch

I'm building the Alpha Schools website. Three files are in the project folder — read all three before doing anything:

ALPHA_MASTER_BUILD.md — the complete source of truth. Follow it exactly.
alpha_schema.sql — the Supabase database schema (already run on my Supabase project).
alpha_content_reference.md — deeper real-content detail.

I also have the approved visual design as dist/index.html (and screenshots) — treat that as the visual source of truth for layout, spacing, colours, and components.
Context on what already exists:

My Supabase project is set up and the schema has been run — tables, RLS, and the media storage bucket exist, and the three schools plus group-wide are seeded.
My Supabase credentials are in .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).
This is a Next.js (App Router, TypeScript) + Tailwind project deploying to Vercel.

What I want you to do now — Phase 1 and the start of Phase 2 from the master doc:

Verify the Supabase connection. Wire up Supabase using @supabase/ssr — a server client and a browser client. Create TypeScript types matching the schema tables, and a small typed data layer with query functions (e.g. getPublishedNews, getUpcomingEvents) that filter published = true where that column exists. Then run a quick check that server-side reads work against my seeded rows. Show me it works before moving on.
Build the homepage to match dist/index.html exactly — same hero ("Learning that takes off" with the aviation badge and scattered student photos), the "Find the right campus" three-school router, the aviation feature block, the stat bar, the "What's New" section, testimonials, and gallery peek. Wire the "What's New" section to read live from Supabase (recent news + upcoming events). Use the brand tokens and real content from the master doc.

Critical rules from the master doc — do not violate these:

NECTA only — remove every mention of Cambridge/IGCSE. The design wrongly shows a Cambridge pathway; it does not exist. Replace with the NECTA framing (11 A-Level combinations) per Part 2 and Part 5.
Images load from Supabase Storage via next/image — never base64-inlined. Keep the site lightweight for mobile.
"3 schools / 2 campuses" — never "3 campuses." Nursery & Primary and Alpha Girls are both in Kunduchi; only Alpha High is in Mikocheni.
Testimonials: real consented quotes only — if none, hide the section. Do not use placeholder names.
Apply the six design fixes in Part 6 as you build (especially: the aviation block text must be readable, not colliding with the image).
Mobile-first, fast-loading, no heavy animation (hover scale/shadow/fade only).

Work through it step by step. After the homepage is matching and connected, stop and show me before we move to the school pages. Don't build all pages at once. i will give you the screen shots

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://alpha-skyline-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/31ce0683-85dc-40ee-8a47-2e81ad85fa46).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
