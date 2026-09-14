-- RLS is the source of truth for authorization. Client role claims are never trusted.

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid() and p.active = true
  limit 1
$$;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'admin', false)
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.unit_types enable row level security;
alter table public.location_unit_types enable row level security;
alter table public.media_assets enable row level security;
alter table public.faqs enable row level security;
alter table public.content_blocks enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_translations enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.audit_log enable row level security;
alter table public.site_settings enable row level security;
alter table public.lead_rate_limits enable row level security;

-- Public catalog/content reads.
create policy locations_public_read on public.locations for select to anon, authenticated
using (status = 'active');
create policy unit_types_public_read on public.unit_types for select to anon, authenticated
using (active = true);
create policy location_unit_types_public_read on public.location_unit_types for select to anon, authenticated
using (
  exists (select 1 from public.locations l where l.id = location_id and l.status = 'active')
  and exists (select 1 from public.unit_types u where u.id = unit_type_id and u.active = true)
);
create policy media_assets_public_read on public.media_assets for select to anon, authenticated
using (is_public = true);
create policy faqs_public_read on public.faqs for select to anon, authenticated
using (active = true);
create policy content_blocks_public_read on public.content_blocks for select to anon, authenticated
using (active = true);
create policy blog_posts_public_read on public.blog_posts for select to anon, authenticated
using (status = 'published' and published_at <= now());
create policy blog_translations_public_read on public.blog_translations for select to anon, authenticated
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_post_id and p.status = 'published' and p.published_at <= now()
  )
);
create policy site_settings_public_read on public.site_settings for select to anon, authenticated
using (is_public = true);

-- Profile access: self-read plus admin-managed role assignments.
create policy profiles_self_read on public.profiles for select to authenticated
using (id = auth.uid());
create policy profiles_admin_read on public.profiles for select to authenticated
using (public.is_admin());
create policy profiles_admin_update on public.profiles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

-- CRM: staff and admin can operate leads; no anonymous policy exists.
create policy leads_staff_read on public.leads for select to authenticated
using (public.current_app_role() in ('admin', 'staff'));
create policy leads_staff_update on public.leads for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy lead_notes_staff_read on public.lead_notes for select to authenticated
using (public.current_app_role() in ('admin', 'staff'));
create policy lead_notes_staff_insert on public.lead_notes for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy lead_status_history_staff_read on public.lead_status_history for select to authenticated
using (public.current_app_role() in ('admin', 'staff'));
create policy lead_status_history_staff_insert on public.lead_status_history for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));

-- Catalog/content mutation: staff or admin, while settings and roles remain admin-only.
create policy locations_staff_write on public.locations for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy unit_types_staff_write on public.unit_types for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy location_unit_types_staff_write on public.location_unit_types for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy media_assets_staff_write on public.media_assets for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy faqs_staff_write on public.faqs for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy content_blocks_staff_write on public.content_blocks for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy blog_posts_staff_write on public.blog_posts for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));
create policy blog_translations_staff_write on public.blog_translations for all to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

create policy site_settings_admin_write on public.site_settings for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy audit_log_admin_read on public.audit_log for select to authenticated
using (public.is_admin());

-- Rate-limit state is server-only (service role bypasses RLS); no client policies.
