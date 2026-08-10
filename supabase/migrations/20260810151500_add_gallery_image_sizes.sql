alter table public.projects
add column if not exists gallery_image_sizes text[] not null default '{}';

alter table public.projects
drop constraint if exists projects_gallery_image_sizes_check;

alter table public.projects
add constraint projects_gallery_image_sizes_check
check (
  gallery_image_sizes <@ array['small', 'medium', 'large', 'full']::text[]
);

update public.projects
set gallery_image_sizes = array_fill('medium'::text, array[greatest(array_length(gallery_image_urls, 1), 1)])
where gallery_image_sizes = '{}'
  and array_length(gallery_image_urls, 1) is not null;
