import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely. Server-only: never import this from a Client
// Component or anything that ends up in the browser bundle (SUPABASE_SERVICE_ROLE_KEY has no
// NEXT_PUBLIC_ prefix specifically so Next.js refuses to expose it client-side). Used by trusted
// server code only: the Payload sync hooks (collections/ClassicsCards.ts) and API routes that
// write visitor data (app/api/pitch/route.ts).
export const createAdminClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
