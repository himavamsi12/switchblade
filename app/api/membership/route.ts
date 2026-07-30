import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

// membership_requests has RLS enabled with no policies at all (see the migration) — writes only
// ever happen here, server-side, with the service_role key, which bypasses RLS. The browser never
// talks to Supabase directly for this table.
export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() || null : null;
  const source = typeof body.source === "string" ? body.source.trim() || null : null;

  const supabase = createAdminClient();
  const ip = getClientIp(request);
  if (await isRateLimited(supabase, "membership_requests", ip)) {
    return NextResponse.json({ error: "Too many submissions — please try again later" }, { status: 429 });
  }

  const { error } = await supabase.from("membership_requests").insert({
    name,
    email,
    source,
    ip_address: ip,
  });

  if (error) {
    console.error("Failed to store membership request:", error.message);
    return NextResponse.json({ error: "Failed to store submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
