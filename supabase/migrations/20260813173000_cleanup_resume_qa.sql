delete from public.resume_request_rate_limits
where visitor_hash in (
  select visitor_hash
  from public.resume_requests
  where email = 'qa-resume@gabrielmorgado.invalid'
    and company = 'Empresa QA'
);

delete from public.resume_requests
where email = 'qa-resume@gabrielmorgado.invalid'
  and company = 'Empresa QA';
