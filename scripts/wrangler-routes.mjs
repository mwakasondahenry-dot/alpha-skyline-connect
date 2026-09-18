/**
 * Adds the site's custom domains to the Worker config that nitro generates.
 *
 * The build writes .output/server/wrangler.json fresh every time, so the
 * domains cannot live in it. Declaring them here keeps `npm run deploy`
 * self-contained: wrangler attaches alphaschools.co.tz and www to the Worker
 * and writes the DNS records itself, instead of someone adding them by hand
 * in the dashboard.
 *
 * Cloudflare must already hold the zone for the domain (nameservers pointed
 * at Cloudflare, zone Active) or the deploy fails with a clear message.
 */
import { readFileSync, writeFileSync } from "node:fs";

const CONFIG = ".output/server/wrangler.json";
const DOMAINS = ["alphaschools.co.tz", "www.alphaschools.co.tz"];

const config = JSON.parse(readFileSync(CONFIG, "utf8"));
config.routes = DOMAINS.map((pattern) => ({ pattern, custom_domain: true }));
writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Custom domains in ${CONFIG}: ${DOMAINS.join(", ")}`);
