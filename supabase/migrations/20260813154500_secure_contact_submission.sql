drop policy if exists "Authenticated admins can read contact messages" on public.contact_messages;
create policy "Portfolio admin can read contact messages"
on public.contact_messages
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Authenticated admins can update contact messages" on public.contact_messages;
create policy "Portfolio admin can update contact messages"
on public.contact_messages
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com')
with check ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Authenticated admins can delete contact messages" on public.contact_messages;
create policy "Portfolio admin can delete contact messages"
on public.contact_messages
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

revoke all on table public.contact_messages from anon;
revoke all on table public.contact_rate_limits from anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

revoke all on function public.submit_contact_message(text, text, text, text, text, text, boolean) from anon, authenticated, public;
grant execute on function public.submit_contact_message(text, text, text, text, text, text, boolean) to service_role;

revoke all on function public.record_contact_notification(uuid, text, text) from anon, authenticated, public;
drop function if exists public.record_contact_notification(uuid, text, text);
