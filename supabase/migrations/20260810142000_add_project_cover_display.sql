alter table public.projects
add column if not exists cover_display text not null default 'thumbnail';

alter table public.projects
drop constraint if exists projects_cover_display_check;

alter table public.projects
add constraint projects_cover_display_check
check (cover_display in ('thumbnail', 'fullscreen'));

update public.projects
set cover_display = 'thumbnail'
where cover_display is null;
