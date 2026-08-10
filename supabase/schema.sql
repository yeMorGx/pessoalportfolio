create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  cover_image_url text not null,
  cover_display text not null default 'thumbnail' check (cover_display in ('thumbnail', 'fullscreen')),
  product_overview text,
  gallery_image_urls text[] not null default '{}',
  video_url text,
  product_role text,
  product_features text[] not null default '{}',
  product_results text[] not null default '{}',
  tech_stack text[] not null default '{}',
  project_url text,
  repo_url text,
  featured boolean not null default false,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_featured_order_idx on public.projects (featured desc, "order" asc);
create index if not exists projects_slug_idx on public.projects (slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "Projects are public to read" on public.projects;
create policy "Projects are public to read"
on public.projects
for select
using (true);

drop policy if exists "Authenticated admins can insert projects" on public.projects;
create policy "Authenticated admins can insert projects"
on public.projects
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update projects" on public.projects;
create policy "Authenticated admins can update projects"
on public.projects
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can delete projects" on public.projects;
create policy "Authenticated admins can delete projects"
on public.projects
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('project-covers', 'project-covers', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Project covers are public to read" on storage.objects;
create policy "Project covers are public to read"
on storage.objects
for select
using (bucket_id = 'project-covers');

drop policy if exists "Authenticated admins can upload project covers" on storage.objects;
create policy "Authenticated admins can upload project covers"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'project-covers');

drop policy if exists "Authenticated admins can update project covers" on storage.objects;
create policy "Authenticated admins can update project covers"
on storage.objects
for update
to authenticated
using (bucket_id = 'project-covers')
with check (bucket_id = 'project-covers');

drop policy if exists "Authenticated admins can delete project covers" on storage.objects;
create policy "Authenticated admins can delete project covers"
on storage.objects
for delete
to authenticated
using (bucket_id = 'project-covers');
