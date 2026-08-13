delete from public.contact_rate_limits
where visitor_hash in (
  select visitor_hash
  from public.contact_messages
  where email = 'qa-contact@gabrielmorgado.invalid'
    and subject = 'QA automatico GAB-6'
);

delete from public.contact_messages
where email = 'qa-contact@gabrielmorgado.invalid'
  and subject = 'QA automatico GAB-6';
