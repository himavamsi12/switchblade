-- Optional Instagram link per classics card, shown as the small IG icon in the detail popup
-- (see the `.detail__ig` anchor in components/classics/ClassicsExperience.tsx).
alter table public.classics_cards add column if not exists instagram_url text;
