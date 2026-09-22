# Deploying to Cloudflare Workers

The site is served by a single Cloudflare Worker: `npm run build` produces it in
`.output/server`, with the static files beside it in `.output/public`. Nothing
about the code changes between the Lovable preview and Cloudflare.

Domain: **alphaschools.co.tz**. Worker name: **alpha-schools**.

## 1. Sign in (once per machine)

```
npx wrangler login
```

A browser window opens for the Cloudflare account. If the school has its own
Cloudflare account, sign in as that account, not a personal one.

Signing in with an address that can see more than one account is fine: the
deploy names the school's account (`Alpha Schools`) itself, in
`scripts/wrangler-routes.mjs`, so it cannot land in a personal one by
accident. Without that, wrangler stops with "More than one account available
but unable to select one in non-interactive mode".

## 2. Set the server secrets (once, then whenever one changes)

The Worker reads these at runtime. Set each one, pasting the value when asked:

```
npx wrangler secret put ALPHA_SUPABASE_URL --name alpha-schools
npx wrangler secret put ALPHA_SUPABASE_ANON_KEY --name alpha-schools
npx wrangler secret put ALPHA_SUPABASE_SERVICE_ROLE_KEY --name alpha-schools
npx wrangler secret put INVITE_LINK_KEY --name alpha-schools
npx wrangler secret put PUBLIC_SITE_URL --name alpha-schools
```

The values are the ones in `.env.local`, except:

- `PUBLIC_SITE_URL` is `https://alphaschools.co.tz`, so invite links point at
  the real domain instead of whatever address served the page.
- `INVITE_LINK_KEY` **must be the same value as `.env.local`**. Change it and
  every invite link already created has to be regenerated before staff can
  share it again.

`ALPHA_SUPABASE_URL_SERVER` and `ALPHA_SUPABASE_ANON_KEY_SERVER` are optional;
the server falls back to the two above.

Paste each value on its own, with no quotes and no line break after it. A
stray newline or quote used to reach Supabase as part of the URL and fail
every database call with "Invalid supabaseUrl"; the code now trims those, but
a wrong value is still a wrong value.

To check what is set: `npx wrangler secret list --name alpha-schools`.

## 3. Deploy

```
npm run deploy
```

That builds and uploads. The first deploy prints a `*.workers.dev` address —
open it and check the home page, `/testimonials` and `/admin/login` before
attaching the domain.

## 4. The domain

`npm run deploy` attaches **alphaschools.co.tz** and **www.alphaschools.co.tz**
to the Worker on every deploy: `scripts/wrangler-routes.mjs` writes them into
the generated Worker config, and wrangler creates the DNS records and the HTTPS
certificate. Change the domains there, not in the dashboard.

Declaring custom domains disables the `*.workers.dev` address. To keep one for
testing, add `"workers_dev": true` in that script's config object.

The domain must already be a zone in the same Cloudflare account:

## Setting the domain up the first time

1. In the Cloudflare dashboard, add **alphaschools.co.tz** as a site (Websites
   → Add a site). Cloudflare gives two nameservers.
2. At the registrar for the `.co.tz` domain, replace the current nameservers
   with those two. Propagation is usually under an hour.
3. Once the site shows as active: Workers & Pages → **alpha-schools** →
   Settings → Domains & Routes → Add → Custom domain → `alphaschools.co.tz`.
   Add `www.alphaschools.co.tz` the same way if the school wants it.

Cloudflare issues the HTTPS certificate itself; nothing else to configure.

## 5. After the domain is live

- Supabase → Authentication → URL Configuration: set **Site URL** to
  `https://alphaschools.co.tz` and add `https://alphaschools.co.tz/**` under
  Redirect URLs, so admin password-reset links work.
- Supabase → Authentication: confirm **"Allow new users to sign up" is off**.
  Any account with a profile row counts as staff.
- Check the three migrations have been run on the Supabase project, in order:
  `alpha_migration_alumni_submissions.sql`,
  `alpha_migration_testimonial_invites.sql`,
  `alpha_migration_parent_invites.sql`.

## Later deploys

```
npm run deploy
```

If a change does not appear on the live site, delete `.output` and deploy
again: a reused build directory has shipped new assets with stale server code,
which looks exactly like a slow cache.

To see what the Worker itself is doing — the real error behind any "something
went wrong" page — run `npx wrangler tail alpha-schools` and reproduce it.

Secrets stay in place between deploys. Pushing to GitHub no longer publishes
anything by itself; it only syncs the code with Lovable's editor.
