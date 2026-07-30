import type { SupabaseClient } from "@supabase/supabase-js";

// Shared by app/api/pitch and app/api/membership — both are public, unauthenticated write
// endpoints with no other abuse protection, so each checks this before inserting rather than
// relying on a separate rate-limiting service. Backed by Supabase (already provisioned) instead of
// an in-memory counter: Vercel functions aren't guaranteed to reuse the same instance between
// requests, so an in-memory count would silently under-count across cold starts/scale-out and
// isn't a real limit. This costs one extra query per submission attempt, which is fine at the
// volume a contact-style form actually sees.
const WINDOW_MINUTES = 10;
const MAX_PER_WINDOW = 3;

/**
 * Pulls the submitter's IP from Vercel's forwarded-for header. Returns null (never throws) if
 * unavailable — e.g. local dev without a proxy in front of it — so callers can decide to allow
 * the request through rather than reject it just because rate-limiting couldn't identify anyone.
 */
export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

/**
 * True if `ip` has hit MAX_PER_WINDOW submissions to `table` in the last WINDOW_MINUTES. Fails
 * OPEN (returns false, i.e. "not rate limited") on a query error or a missing ip — a broken rate
 * check shouldn't be the reason a real visitor's form submission is rejected; it only exists to
 * blunt obvious spam, not to be a hard security boundary.
 */
export async function isRateLimited(
  supabase: SupabaseClient,
  table: "pitch_submissions" | "membership_requests",
  ip: string | null,
): Promise<boolean> {
  if (!ip) return false;
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", since);
  if (error) {
    console.error(`Rate-limit check failed for ${table}:`, error.message);
    return false;
  }
  return (count ?? 0) >= MAX_PER_WINDOW;
}
