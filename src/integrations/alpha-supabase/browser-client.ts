// Lazy browser Supabase client for Alpha admin auth.
// Fetches config once from the server, caches the client instance.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/alpha-supabase/types";
import { getAlphaSupabaseConfig } from "./config.functions";

let clientPromise: Promise<SupabaseClient<Database>> | null = null;

export function getBrowserSupabase(): Promise<SupabaseClient<Database>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser Supabase used on the server"));
  }
  if (!clientPromise) {
    clientPromise = getAlphaSupabaseConfig().then(({ url, anonKey }) =>
      createClient<Database>(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: "alpha-admin-auth",
        },
      }),
    );
  }
  return clientPromise;
}
