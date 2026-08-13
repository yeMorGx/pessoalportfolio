create or replace function public.submit_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_locale text,
  p_visitor_hash text,
  p_notification_requested boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  rate_limit_row public.contact_rate_limits%rowtype;
  message_id uuid;
  request_time timestamptz := now();
begin
  if char_length(trim(p_name)) not between 2 and 80
    or char_length(trim(p_email)) not between 3 and 254
    or char_length(trim(p_subject)) not between 3 and 120
    or char_length(trim(p_message)) not between 20 and 4000
    or p_locale not in ('en', 'pt')
    or char_length(p_visitor_hash) <> 64 then
    raise exception 'CONTACT_INVALID_INPUT';
  end if;

  delete from public.contact_rate_limits
  where window_started_at < request_time - interval '1 day';

  insert into public.contact_rate_limits (visitor_hash, window_started_at, submission_count)
  values (p_visitor_hash, request_time, 0)
  on conflict (visitor_hash) do nothing;

  select *
  into rate_limit_row
  from public.contact_rate_limits
  where visitor_hash = p_visitor_hash
  for update;

  if rate_limit_row.window_started_at > request_time - interval '15 minutes'
    and rate_limit_row.submission_count >= 3 then
    raise exception 'CONTACT_RATE_LIMIT';
  end if;

  if rate_limit_row.window_started_at <= request_time - interval '15 minutes' then
    update public.contact_rate_limits
    set window_started_at = request_time, submission_count = 1
    where visitor_hash = p_visitor_hash;
  else
    update public.contact_rate_limits
    set submission_count = submission_count + 1
    where visitor_hash = p_visitor_hash;
  end if;

  insert into public.contact_messages (
    name,
    email,
    subject,
    message,
    locale,
    notification_status,
    visitor_hash
  )
  values (
    trim(p_name),
    lower(trim(p_email)),
    trim(p_subject),
    trim(p_message),
    p_locale,
    case when p_notification_requested then 'pending' else 'not_configured' end,
    p_visitor_hash
  )
  returning id into message_id;

  return message_id;
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text, text, text, boolean) from anon, authenticated, public;
grant execute on function public.submit_contact_message(text, text, text, text, text, text, boolean) to service_role;
