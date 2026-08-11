alter table public.projects
add column if not exists gallery_image_descriptions text[] not null default '{}';
