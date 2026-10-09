import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Anonymous, cookie-free client for public reads (RLS "public read" policies). Unlike
// lib/supabase/server.ts it never touches cookies(), so a page using it can be statically
// rendered and cached instead of opting into per-request rendering.
export const createPublicClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
