-- Supabase projects can grant EXECUTE on new public functions to anon by default.
-- These SECURITY DEFINER helpers are internal RLS helpers, not anonymous RPCs.
revoke execute on function public.current_app_role() from anon, public;
revoke execute on function public.is_admin() from anon, public;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
