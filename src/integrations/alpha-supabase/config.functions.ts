// Returns Alpha Supabase URL + anon key to the browser.
// Anon keys are publishable; this is safe to send to the client.
import { createServerFn } from "@tanstack/react-start";

export type AlphaSupabaseConfig = { url: string; anonKey: string };

export const getAlphaSupabaseConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<AlphaSupabaseConfig> => {
    const rawUrl =
      process.env.ALPHA_SUPABASE_URL_SERVER ?? process.env.ALPHA_SUPABASE_URL;
    const anonKey =
      process.env.ALPHA_SUPABASE_ANON_KEY_SERVER ??
      process.env.ALPHA_SUPABASE_ANON_KEY;
    if (!rawUrl || !anonKey) {
      throw new Error("Alpha Supabase config missing");
    }
    const url = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
    return { url, anonKey };
  },
);
