create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  logo_image_url text,
  cover_image_url text not null,
  cover_display text not null default 'thumbnail' check (cover_display in ('thumbnail', 'fullscreen')),
  product_overview text,
  gallery_image_urls text[] not null default '{}',
  gallery_image_sizes text[] not null default '{}',
  gallery_image_descriptions text[] not null default '{}',
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

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 20 and 4000),
  locale text not null default 'pt' check (locale in ('en', 'pt')),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  notification_status text not null default 'not_configured' check (notification_status in ('not_configured', 'pending', 'sent', 'failed')),
  notification_sent_at timestamptz,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_status_created_at_idx
on public.contact_messages (status, created_at desc);

create table if not exists public.contact_rate_limits (
  visitor_hash text primary key,
  window_started_at timestamptz not null default now(),
  submission_count integer not null default 0 check (submission_count >= 0)
);

create index if not exists contact_rate_limits_window_idx
on public.contact_rate_limits (window_started_at);

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row
execute function public.set_updated_at();

alter table public.contact_messages enable row level security;
alter table public.contact_rate_limits enable row level security;

drop policy if exists "Authenticated admins can read contact messages" on public.contact_messages;
drop policy if exists "Portfolio admin can read contact messages" on public.contact_messages;
create policy "Portfolio admin can read contact messages"
on public.contact_messages
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Authenticated admins can update contact messages" on public.contact_messages;
drop policy if exists "Portfolio admin can update contact messages" on public.contact_messages;
create policy "Portfolio admin can update contact messages"
on public.contact_messages
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com')
with check ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Authenticated admins can delete contact messages" on public.contact_messages;
drop policy if exists "Portfolio admin can delete contact messages" on public.contact_messages;
create policy "Portfolio admin can delete contact messages"
on public.contact_messages
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

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

  select * into rate_limit_row
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

  insert into public.contact_messages (name, email, subject, message, locale, notification_status, visitor_hash)
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

revoke all on table public.contact_messages from anon;
revoke all on table public.contact_rate_limits from anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

revoke all on function public.submit_contact_message(text, text, text, text, text, text, boolean) from anon, authenticated, public;
grant execute on function public.submit_contact_message(text, text, text, text, text, text, boolean) to service_role;

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

drop policy if exists "Portfolio admin can read resume requests" on public.resume_requests;
create policy "Portfolio admin can read resume requests"
on public.resume_requests for select to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Portfolio admin can update resume requests" on public.resume_requests;
create policy "Portfolio admin can update resume requests"
on public.resume_requests for update to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com')
with check ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Portfolio admin can delete resume requests" on public.resume_requests;
create policy "Portfolio admin can delete resume requests"
on public.resume_requests for delete to authenticated
using ((auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

revoke all on table public.resume_requests from anon;
revoke all on table public.resume_request_rate_limits from anon, authenticated;
grant select, update, delete on table public.resume_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-resume', 'private-resume', false, 5242880, array['application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio admin can read private resume" on storage.objects;
create policy "Portfolio admin can read private resume" on storage.objects for select to authenticated
using (bucket_id = 'private-resume' and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Portfolio admin can upload private resume" on storage.objects;
create policy "Portfolio admin can upload private resume" on storage.objects for insert to authenticated
with check (bucket_id = 'private-resume' and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Portfolio admin can update private resume" on storage.objects;
create policy "Portfolio admin can update private resume" on storage.objects for update to authenticated
using (bucket_id = 'private-resume' and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com')
with check (bucket_id = 'private-resume' and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

drop policy if exists "Portfolio admin can delete private resume" on storage.objects;
create policy "Portfolio admin can delete private resume" on storage.objects for delete to authenticated
using (bucket_id = 'private-resume' and (auth.jwt() ->> 'email') = 'gabrielmcgoes@gmail.com');

create or replace function public.submit_resume_request(
  p_name text, p_email text, p_company text, p_job_title text, p_linkedin_url text,
  p_purpose text, p_locale text, p_status_token_hash text, p_visitor_hash text,
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
  delete from public.resume_request_rate_limits where window_started_at < request_time - interval '2 days';
  insert into public.resume_request_rate_limits (visitor_hash, window_started_at, submission_count)
  values (p_visitor_hash, request_time, 0) on conflict (visitor_hash) do nothing;

  select * into rate_limit_row from public.resume_request_rate_limits
  where visitor_hash = p_visitor_hash for update;

  if rate_limit_row.window_started_at > request_time - interval '1 day' and rate_limit_row.submission_count >= 3 then
    raise exception 'RESUME_RATE_LIMIT';
  end if;

  if rate_limit_row.window_started_at <= request_time - interval '1 day' then
    update public.resume_request_rate_limits set window_started_at = request_time, submission_count = 1
    where visitor_hash = p_visitor_hash;
  else
    update public.resume_request_rate_limits set submission_count = submission_count + 1
    where visitor_hash = p_visitor_hash;
  end if;

  insert into public.resume_requests (
    name, email, company, job_title, linkedin_url, purpose, locale,
    status_token_hash, visitor_hash, request_notification_status
  ) values (
    p_name, p_email, p_company, p_job_title, nullif(p_linkedin_url, ''), p_purpose,
    p_locale, p_status_token_hash, p_visitor_hash,
    case when p_notification_requested then 'pending' else 'not_configured' end
  ) returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.submit_resume_request(text, text, text, text, text, text, text, text, text, boolean) from anon, authenticated, public;
grant execute on function public.submit_resume_request(text, text, text, text, text, text, text, text, text, boolean) to service_role;
