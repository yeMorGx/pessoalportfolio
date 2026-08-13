create table if not exists public.resume_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 254),
  company text not null check (char_length(company) between 2 and 120),
  job_title text not null check (char_length(job_title) between 2 and 120),
  linkedin_url text,
  purpose text not null check (char_length(purpose) between 20 and 2000),
  locale text not null default 'pt' check (locale in ('en', 'pt')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
  status_token_hash text not null unique check (char_length(status_token_hash) = 64),
  access_token_hash text unique check (access_token_hash is null or char_length(access_token_hash) = 64),
  access_expires_at timestamptz,
  resume_file_path text not null default 'current/gabriel-morgado-resume.pdf',
  admin_note text,
  request_notification_status text not null default 'not_configured' check (request_notification_status in ('not_configured', 'pending', 'sent', 'failed')),
  decision_notification_status text not null default 'not_configured' check (decision_notification_status in ('not_configured', 'pending', 'sent', 'failed')),
  visitor_hash text not null,
  approved_at timestamptz,
  rejected_at timestamptz,
  revoked_at timestamptz,
  last_download_at timestamptz,
  download_count integer not null default 0 check (download_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resume_requests_status_created_at_idx
on public.resume_requests (status, created_at desc);

create table if not exists public.resume_request_rate_limits (
  visitor_hash text primary key,
  window_started_at timestamptz not null default now(),
  submission_count integer not null default 0 check (submission_count >= 0)
);

create index if not exists resume_request_rate_limits_window_idx
on public.resume_request_rate_limits (window_started_at);

drop trigger if exists resume_requests_set_updated_at on public.resume_requests;
create trigger resume_requests_set_updated_at
before update on public.resume_requests
for each row
execute function public.set_updated_at();

alter table public.resume_requests enable row level security;
alter table public.resume_request_rate_limits enable row level security;

create policy "Portfolio admin can read resume requests"
on public.resume_requests
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

create policy "Portfolio admin can update resume requests"
on public.resume_requests
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com')
with check ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

create policy "Portfolio admin can delete resume requests"
on public.resume_requests
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

revoke all on table public.resume_requests from anon;
revoke all on table public.resume_request_rate_limits from anon, authenticated;
grant select, update, delete on table public.resume_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-resume', 'private-resume', false, 5242880, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Portfolio admin can read private resume"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'private-resume'
  and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com'
);

create policy "Portfolio admin can upload private resume"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'private-resume'
  and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com'
);

create policy "Portfolio admin can update private resume"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'private-resume'
  and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com'
)
with check (
  bucket_id = 'private-resume'
  and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com'
);

create policy "Portfolio admin can delete private resume"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'private-resume'
  and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com'
);

create or replace function public.submit_resume_request(
  p_name text,
  p_email text,
  p_company text,
  p_job_title text,
  p_linkedin_url text,
  p_purpose text,
  p_locale text,
  p_status_token_hash text,
  p_visitor_hash text,
  p_notification_requested boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_time timestamptz := now();
  rate_limit_row public.resume_request_rate_limits%rowtype;
  request_id uuid;
begin
  delete from public.resume_request_rate_limits
  where window_started_at < request_time - interval '2 days';

  insert into public.resume_request_rate_limits (visitor_hash, window_started_at, submission_count)
  values (p_visitor_hash, request_time, 0)
  on conflict (visitor_hash) do nothing;

  select * into rate_limit_row
  from public.resume_request_rate_limits
  where visitor_hash = p_visitor_hash
  for update;

  if rate_limit_row.window_started_at > request_time - interval '1 day'
    and rate_limit_row.submission_count >= 3 then
    raise exception 'RESUME_RATE_LIMIT';
  end if;

  if rate_limit_row.window_started_at <= request_time - interval '1 day' then
    update public.resume_request_rate_limits
    set window_started_at = request_time, submission_count = 1
    where visitor_hash = p_visitor_hash;
  else
    update public.resume_request_rate_limits
    set submission_count = submission_count + 1
    where visitor_hash = p_visitor_hash;
  end if;

  insert into public.resume_requests (
    name,
    email,
    company,
    job_title,
    linkedin_url,
    purpose,
    locale,
    status_token_hash,
    visitor_hash,
    request_notification_status
  ) values (
    p_name,
    p_email,
    p_company,
    p_job_title,
    nullif(p_linkedin_url, ''),
    p_purpose,
    p_locale,
    p_status_token_hash,
    p_visitor_hash,
    case when p_notification_requested then 'pending' else 'not_configured' end
  )
  returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.submit_resume_request(text, text, text, text, text, text, text, text, text, boolean) from anon, authenticated, public;
grant execute on function public.submit_resume_request(text, text, text, text, text, text, text, text, text, boolean) to service_role;
