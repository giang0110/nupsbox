-- P3.36 make the server-only rate-limit boundary explicit for database linters and future maintainers.
drop policy if exists lead_rate_limits_client_deny on public.lead_rate_limits;

create policy lead_rate_limits_client_deny
on public.lead_rate_limits
for all
to anon, authenticated
using (false)
with check (false);

revoke all privileges on table public.lead_rate_limits from anon, authenticated;
