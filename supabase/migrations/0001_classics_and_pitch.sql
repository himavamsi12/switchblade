-- Classics cards: mirrors the Payload "classics-cards" collection so the deployed site can read
-- content that's edited in the Payload admin, without querying Payload's own (local-only, broken
-- on Vercel) sqlite db at request time. payload_id ties each row back to its Payload document so
-- the sync hook can upsert/delete the matching row instead of ever duplicating one.
create table if not exists public.classics_cards (
  id          uuid primary key default gen_random_uuid(),
  payload_id  integer unique not null,
  heading     text not null,
  category    text not null,
  -- Payload's "paragraph" field is one textarea with blank-line-separated paragraphs; stored here
  -- already split into an array (one entry per paragraph) to match the site's CmsProject.body shape.
  body        jsonb not null default '[]'::jsonb,
  image_url   text not null,
  gallery     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.classics_cards enable row level security;

-- Public/anon read only — the site fetches this table with the publishable (anon) key from a
-- server component. All writes happen exclusively from the Payload sync hook using the
-- service_role key, which bypasses RLS entirely, so no insert/update/delete policy is needed here.
create policy "classics_cards public read"
  on public.classics_cards for select
  to anon
  using (true);

-- Collaborate page "Drop a Pitch" form submissions. Deliberately no RLS policies at all beyond
-- enabling RLS: this locks the table to service_role-only access (both read and write) since it
-- holds visitor contact info, and the insert happens server-side (app/api/pitch) with the
-- service_role key, never from the browser.
create table if not exists public.pitch_submissions (
  id                uuid primary key default gen_random_uuid(),
  name_or_craft     text not null,
  portfolio_link    text,
  project_idea      text,
  contact           text not null,
  created_at        timestamptz not null default now()
);

alter table public.pitch_submissions enable row level security;
