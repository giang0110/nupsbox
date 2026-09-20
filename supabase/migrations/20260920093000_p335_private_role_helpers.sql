-- P3.35 move SECURITY DEFINER role helpers out of the exposed public API schema.
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

alter function public.current_app_role() set schema private;
alter function public.is_admin() set schema private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.current_app_role() = 'admin', false)
$$;

revoke all on function private.current_app_role() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.current_app_role() to authenticated;
grant execute on function private.is_admin() to authenticated;
