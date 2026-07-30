-- IP tracking for basic rate limiting on the two public write endpoints (app/api/pitch,
-- app/api/membership) — before inserting, the route checks how many rows from the same IP exist
-- in the last window and rejects with 429 if over the limit. Nullable: IP may be unavailable in
-- some environments (e.g. local dev without a proxy header), and a submission shouldn't fail
-- outright just because rate-limiting couldn't identify the submitter.
alter table public.pitch_submissions add column if not exists ip_address text;
alter table public.membership_requests add column if not exists ip_address text;

-- Rate-limit checks filter by ip_address + created_at on every submission attempt (not just
-- successful ones), so this index keeps that query fast as the tables grow.
create index if not exists pitch_submissions_ip_created_idx
  on public.pitch_submissions (ip_address, created_at);
create index if not exists membership_requests_ip_created_idx
  on public.membership_requests (ip_address, created_at);
