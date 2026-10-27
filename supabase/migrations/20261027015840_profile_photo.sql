create table public.site_settings (
  id boolean primary key default true check (id),
  about_photo_path text check (about_photo_path is null or about_photo_path ~ '^portraits/[a-f0-9-]{36}\.(jpg|png|webp)$')
);
insert into public.site_settings (id) values (true);
alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant update (about_photo_path) on public.site_settings to authenticated;
create policy "Site settings are public to read" on public.site_settings for select to anon, authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
create policy "Profile photos are public to read" on storage.objects for select to anon, authenticated using (bucket_id = 'profile-photos');

-- Production uses the private helper; older local databases use the public helper.
-- Reuse whichever admin registry is already installed, without changing it.
do $$
declare
  admin_check text;
begin
  if to_regprocedure('private.is_portfolio_admin()') is not null then
    admin_check := 'private.is_portfolio_admin()';
  elsif to_regprocedure('public.is_portfolio_admin()') is not null then
    admin_check := 'public.is_portfolio_admin()';
  else
    raise exception 'Install the portfolio admin access migration before profile_photo';
  end if;
  execute format('create policy "Portfolio admins can update site settings" on public.site_settings for update to authenticated using (%s) with check (%s)', admin_check, admin_check);
  execute format('create policy "Portfolio admins can upload profile photos" on storage.objects for insert to authenticated with check (bucket_id = ''profile-photos'' and %s)', admin_check);
end;
$$;
