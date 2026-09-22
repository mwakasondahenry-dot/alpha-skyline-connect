/**
 * Adjusts the Worker config that nitro generates before wrangler reads it.
 *
 * The build writes .output/server/wrangler.json fresh every time, so neither
 * of these settings can live in it. Declaring them here keeps `npm run deploy`
 * self-contained: wrangler attaches alphaschools.co.tz and www to the Worker
 * and writes the DNS records itself, instead of someone adding them by hand
 * in the dashboard.
 *
 * ACCOUNT is the school's own Cloudflare account, which holds the Worker and
 * the zone. The login on a machine can see a personal account too, and
 * wrangler refuses to guess between them; naming it here means a deploy
 * cannot land in the wrong one.
 *
 * Cloudflare must already hold the zone for the domain (nameservers pointed
 * at Cloudflare, zone Active) or the deploy fails with a clear message.
 *
 * html_handling defaults to "auto-trailing-slash", which answers a request for
 * a static .html file with a 307 to the same path without the extension. Every
 * page on this site is server-rendered, so the only files that reach that rule
 * are ones that have to keep their exact URL — Google's site verification
 * token is fetched at /googleb239962655abf8c7.html and a redirect fails the
 * check. "none" serves assets at the paths they are stored under; anything
 * with no matching file still falls through to the Worker and renders as
 * usual.
 */
import { readFileSync, writeFileSync } from "node:fs";

const CONFIG = ".output/server/wrangler.json";
const DOMAINS = ["alphaschools.co.tz", "www.alphaschools.co.tz"];
const ACCOUNT = "7cae3099961a38549e44743437d474c0"; // Alpha Schools

const config = JSON.parse(readFileSync(CONFIG, "utf8"));
config.routes = DOMAINS.map((pattern) => ({ pattern, custom_domain: true }));
config.assets = { ...config.assets, html_handling: "none" };
config.account_id = ACCOUNT;
writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Custom domains in ${CONFIG}: ${DOMAINS.join(", ")}`);
console.log(`Asset html_handling: ${config.assets.html_handling}`);
console.log(`Account: ${ACCOUNT}`);
