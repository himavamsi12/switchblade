import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// pitch_submissions has RLS enabled with no policies at all (see the migration) — writes only
// ever happen here, server-side, with the service_role key, which bypasses RLS. The browser never
// talks to Supabase directly for this table.
export async function POST(request: Request) {
  const body = await request.json();
  const nameOrCraft = typeof body.nameOrCraft === "string" ? body.nameOrCraft.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";

  if (!nameOrCraft || !contact) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const portfolioLink = typeof body.portfolioLink === "string" ? body.portfolioLink.trim() || null : null;
  const projectIdea = typeof body.projectIdea === "string" ? body.projectIdea.trim() || null : null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("pitch_submissions").insert({
    name_or_craft: nameOrCraft,
    portfolio_link: portfolioLink,
    project_idea: projectIdea,
    contact,
  });

  if (error) {
    console.error("Failed to store pitch submission:", error.message);
    return NextResponse.json({ error: "Failed to store submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
