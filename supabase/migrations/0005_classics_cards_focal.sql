-- Per-image focal point for classics cards, so an editor can decide which part of a photo stays
-- visible when the site crops it.
--
-- Every surface in the classics gallery cover-crops: the 3D panels squeeze the image into a ~3:4
-- portrait plane, the detail popup's media box is wide, and the thumbnail strip is 84x64. Until
-- now all three cropped from a fixed anchor (the panels centered, the popup and thumbs pinned to
-- `object-position: top`, itself a blanket workaround for "images are cutting on top"), which is
-- right for some photos and wrong for others with no way to tell them apart.
--
-- Payload's focal point editor writes media.focalX/focalY as percentages 0-100 from the image's
-- top-left. Mirrored here by the classics-cards sync hook so the public site can anchor each crop
-- to the point the editor picked. 50/50 is dead center, which is Payload's own default and
-- reproduces the previous centered behaviour for any card nobody has adjusted.
alter table public.classics_cards
  add column if not exists image_focal_x smallint not null default 50,
  add column if not exists image_focal_y smallint not null default 50;

-- Gallery entries gain the same treatment. The column keeps its jsonb type but its element shape
-- widens from a bare URL string to { url, focal_x, focal_y }. Existing rows are migrated in place
-- below; the site's reader (app/(app)/classics/page.tsx) also still accepts the old bare-string
-- form, so a row written by an older deploy mid-rollout renders fine instead of blanking out.
update public.classics_cards
set gallery = (
  select coalesce(
    jsonb_agg(
      case
        when jsonb_typeof(entry) = 'string'
          then jsonb_build_object('url', entry #>> '{}', 'focal_x', 50, 'focal_y', 50)
        else entry
      end
      order by ord
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(gallery) with ordinality as t(entry, ord)
)
where jsonb_typeof(gallery) = 'array'
  and exists (
    select 1 from jsonb_array_elements(gallery) as e(entry)
    where jsonb_typeof(entry) = 'string'
  );
