update public.job_source_health
set enabled=false,status='disabled',updated_at=now()
where source_key in ('Arbeitnow','Jooble');
