-- Membership / waitlist requests from the two "request access" forms: the full form on
-- app/(app)/membership/page.tsx (name + email + source) and the shorter email-only capture on
-- components/concept/MembershipPreview.tsx. Same access pattern as pitch_submissions: RLS enabled
-- with no policies at all, so only the service_role key (used server-side in app/api/membership)
-- can read or write it.
create table if not exists public.membership_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text not null,
  source      text,
  created_at  timestamptz not null default now()
);

alter table public.membership_requests enable row level security;
