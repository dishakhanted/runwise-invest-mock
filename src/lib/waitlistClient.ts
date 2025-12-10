import { createClient } from "@supabase/supabase-js";

const WAITLIST_SUPABASE_URL = import.meta.env.VITE_WAITLIST_SUPABASE_URL;
const WAITLIST_SUPABASE_ANON_KEY = import.meta.env.VITE_WAITLIST_SUPABASE_ANON_KEY;

if (!WAITLIST_SUPABASE_URL || !WAITLIST_SUPABASE_ANON_KEY) {
  console.warn(
    "Waitlist Supabase env vars are missing. Check VITE_WAITLIST_SUPABASE_URL and VITE_WAITLIST_SUPABASE_ANON_KEY."
  );
}

export const waitlistSupabase =
  WAITLIST_SUPABASE_URL && WAITLIST_SUPABASE_ANON_KEY
    ? createClient(WAITLIST_SUPABASE_URL, WAITLIST_SUPABASE_ANON_KEY)
    : null;

// Log presence (not values) to aid troubleshooting without exposing secrets.
console.info("waitlist env", {
  urlSet: Boolean(WAITLIST_SUPABASE_URL),
  anonKeySet: Boolean(WAITLIST_SUPABASE_ANON_KEY),
  mode: import.meta.env.MODE,
});

