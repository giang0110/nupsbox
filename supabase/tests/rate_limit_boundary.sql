begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select ok(
  exists(
    select 1 from pg_policies
    where schemaname='public'
      and tablename='lead_rate_limits'
      and policyname='lead_rate_limits_client_deny'
      and cmd='ALL'
  ),
  'rate-limit table has an explicit client deny policy'
);

select ok(
  coalesce((
    select qual = 'false'
    from pg_policies
    where schemaname='public'
      and tablename='lead_rate_limits'
      and policyname='lead_rate_limits_client_deny'
  ), false),
  'rate-limit deny policy blocks reads'
);

select ok(
  not has_table_privilege('anon', 'public.lead_rate_limits', 'SELECT, INSERT, UPDATE, DELETE'),
  'anon has no rate-limit table privileges'
);

select ok(
  not has_table_privilege('authenticated', 'public.lead_rate_limits', 'SELECT, INSERT, UPDATE, DELETE'),
  'authenticated has no rate-limit table privileges'
);

select * from finish();
rollback;
