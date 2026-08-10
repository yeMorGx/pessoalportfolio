alter table public.projects
add column if not exists product_overview text,
add column if not exists gallery_image_urls text[] not null default '{}',
add column if not exists video_url text,
add column if not exists product_role text,
add column if not exists product_features text[] not null default '{}',
add column if not exists product_results text[] not null default '{}';

update public.projects
set
  gallery_image_urls = case
    when gallery_image_urls = '{}' then array[cover_image_url]
    else gallery_image_urls
  end,
  product_overview = coalesce(product_overview, description);
