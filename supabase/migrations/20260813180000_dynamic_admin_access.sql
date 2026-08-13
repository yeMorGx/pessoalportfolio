create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.portfolio_admins enable row level security;
revoke all on table public.portfolio_admins from anon, authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolio_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_portfolio_admin() from public, anon;
grant execute on function public.is_portfolio_admin() to authenticated, service_role;

drop policy if exists "Portfolio admin can read contact messages" on public.contact_messages;
create policy "Portfolio admin can read contact messages"
on public.contact_messages for select to authenticated
using (public.is_portfolio_admin());

drop policy if exists "Portfolio admin can update contact messages" on public.contact_messages;
create policy "Portfolio admin can update contact messages"
on public.contact_messages for update to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin can delete contact messages" on public.contact_messages;
create policy "Portfolio admin can delete contact messages"
on public.contact_messages for delete to authenticated
using (public.is_portfolio_admin());

drop policy if exists "Portfolio admin can read resume requests" on public.resume_requests;
create policy "Portfolio admin can read resume requests"
on public.resume_requests for select to authenticated
using (public.is_portfolio_admin());

drop policy if exists "Portfolio admin can update resume requests" on public.resume_requests;
create policy "Portfolio admin can update resume requests"
on public.resume_requests for update to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin can delete resume requests" on public.resume_requests;
create policy "Portfolio admin can delete resume requests"
on public.resume_requests for delete to authenticated
using (public.is_portfolio_admin());

drop policy if exists "Portfolio admin can read private resume" on storage.objects;
create policy "Portfolio admin can read private resume"
on storage.objects for select to authenticated
using (bucket_id = 'private-resume' and public.is_portfolio_admin());

drop policy if exists "Portfolio admin can upload private resume" on storage.objects;
create policy "Portfolio admin can upload private resume"
on storage.objects for insert to authenticated
with check (bucket_id = 'private-resume' and public.is_portfolio_admin());

drop policy if exists "Portfolio admin can update private resume" on storage.objects;
create policy "Portfolio admin can update private resume"
on storage.objects for update to authenticated
using (bucket_id = 'private-resume' and public.is_portfolio_admin())
with check (bucket_id = 'private-resume' and public.is_portfolio_admin());

drop policy if exists "Portfolio admin can delete private resume" on storage.objects;
create policy "Portfolio admin can delete private resume"
on storage.objects for delete to authenticated
using (bucket_id = 'private-resume' and public.is_portfolio_admin());
