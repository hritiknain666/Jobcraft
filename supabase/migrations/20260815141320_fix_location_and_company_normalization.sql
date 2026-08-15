create or replace function public.jobcraft_canonical_company(value text)
returns text language sql immutable parallel safe as $$
  select trim(regexp_replace(public.jobcraft_canonical_text(value),'[[:space:]]+(private limited|pvt ltd|pvt limited|limited|ltd|incorporated|inc|llc|corp|corporation)$','','g'));
$$;

create or replace function public.jobcraft_normalize_location(value text)
returns text language plpgsql immutable parallel safe as $$
declare v text := public.jobcraft_canonical_text(value);
begin
  if v='' then return 'India'; end if;
  if v like '%bengaluru%' or v like '%bangalore%' then return 'Bengaluru'; end if;
  if v like '%gurugram%' or v like '%gurgaon%' then return 'Gurugram'; end if;
  if v like '%mumbai%' or v like '%bombay%' then return 'Mumbai'; end if;
  if v like '%noida%' then return 'Noida'; end if;
  if v like '%new delhi%' or v like '%delhi ncr%' or v='delhi' or v like 'delhi %' or v like '% delhi' then return 'Delhi NCR'; end if;
  if v like '%hyderabad%' then return 'Hyderabad'; end if;
  if v like '%pune%' then return 'Pune'; end if;
  if v like '%chennai%' then return 'Chennai'; end if;
  if v like '%kolkata%' or v like '%calcutta%' then return 'Kolkata'; end if;
  if v like '%ahmedabad%' then return 'Ahmedabad'; end if;
  if v like '%kochi%' or v like '%cochin%' then return 'Kochi'; end if;
  if v like '%jaipur%' then return 'Jaipur'; end if;
  if v like '%chandigarh%' then return 'Chandigarh'; end if;
  if v like '%coimbatore%' then return 'Coimbatore'; end if;
  if v like '%indore%' then return 'Indore'; end if;
  if v like '%surat%' then return 'Surat'; end if;
  if v like '%vadodara%' then return 'Vadodara'; end if;
  if v like '%nashik%' then return 'Nashik'; end if;
  if v like '%mysuru%' or v like '%mysore%' then return 'Mysuru'; end if;
  if v='remote' or v like '%work from home%' or v='wfh' then return 'Remote'; end if;
  if v='india' then return 'India'; end if;
  return left(trim(coalesce(value,'India')),180);
end;
$$;

update public.jobs set location=location,company=company;
select public.jobcraft_dedupe_jobs();
select public.jobcraft_run_feed_maintenance();
