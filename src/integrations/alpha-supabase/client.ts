// Browser-safe Supabase client for Alpha Schools' external Supabase project.
// Uses ALPHA_* env vars (the VITE_/SUPABASE_ prefixes are reserved by Lovable Cloud).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = import.meta.env.VITE_ALPHA_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_ALPHA_SUPABASE_ANON_KEY as string | undefined;

// In the browser we read from VITE_ALPHA_* (exposed by Vite). The server uses
// process.env.ALPHA_SUPABASE_URL_SERVER / ALPHA_SUPABASE_ANON_KEY_SERVER.
export const alphaSupabase: SupabaseClient<Database> = createClient<Database>(
  url ?? "",
  anon ?? "",
  {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
    },
  },
);
