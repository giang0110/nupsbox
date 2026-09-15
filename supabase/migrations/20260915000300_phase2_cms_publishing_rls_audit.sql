-- Phase 2 P2.2 CMS publication, slug integrity, explicit RLS, and audit contracts.

alter table public.locations
  add column published_at timestamptz;

alter table public.unit_types
  add column published_at timestamptz;

-- Existing public catalog rows have already crossed the first-publication boundary.
update public.locations
set published_at = coalesce(created_at, now())
where status = 'active' and published_at is null;

update public.unit_types
set published_at = coalesce(created_at, now())
where active = true and published_at is null;

create or replace function public.set_location_first_published_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.status = 'active' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create or replace function public.set_unit_type_first_published_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.active = true and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger locations_set_first_published_at
before insert or update of status on public.locations
for each row execute function public.set_location_first_published_at();

create trigger unit_types_set_first_published_at
before insert or update of active on public.unit_types
for each row execute function public.set_unit_type_first_published_at();

create or replace function public.lock_slug_after_publication()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if old.published_at is not null and old.slug is distinct from new.slug then
    raise exception 'published_slug_immutable'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger locations_lock_published_slug
before update of slug on public.locations
for each row execute function public.lock_slug_after_publication();

create trigger unit_types_lock_published_slug
before update of slug on public.unit_types
for each row execute function public.lock_slug_after_publication();

create trigger blog_posts_lock_published_slug
before update of slug on public.blog_posts
for each row execute function public.lock_slug_after_publication();

-- Replace broad Phase 1 catalog/content policies with explicit read/insert/update contracts.
drop policy if exists locations_staff_write on public.locations;
create policy locations_authenticated_read_all
on public.locations for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy locations_staff_insert
on public.locations for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy locations_staff_update
on public.locations for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

drop policy if exists unit_types_staff_write on public.unit_types;
create policy unit_types_authenticated_read_all
on public.unit_types for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy unit_types_staff_insert
on public.unit_types for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy unit_types_staff_update
on public.unit_types for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

drop policy if exists location_unit_types_staff_write on public.location_unit_types;
create policy location_unit_types_authenticated_read_all
on public.location_unit_types for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy location_unit_types_staff_insert
on public.location_unit_types for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy location_unit_types_staff_update
on public.location_unit_types for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

drop policy if exists media_assets_staff_write on public.media_assets;
create policy media_assets_authenticated_read_all
on public.media_assets for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy media_assets_staff_insert
on public.media_assets for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy media_assets_staff_update
on public.media_assets for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

drop policy if exists faqs_staff_write on public.faqs;
create policy faqs_authenticated_read_all
on public.faqs for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy faqs_staff_insert
on public.faqs for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy faqs_staff_update
on public.faqs for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

drop policy if exists blog_posts_staff_write on public.blog_posts;
create policy blog_posts_authenticated_read_all
on public.blog_posts for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy blog_posts_staff_insert
on public.blog_posts for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy blog_posts_staff_update
on public.blog_posts for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

drop policy if exists blog_translations_staff_write on public.blog_translations;
create policy blog_translations_authenticated_read_all
on public.blog_translations for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy blog_translations_staff_insert
on public.blog_translations for insert to authenticated
with check (public.current_app_role() in ('admin', 'staff'));
create policy blog_translations_staff_update
on public.blog_translations for update to authenticated
using (public.current_app_role() in ('admin', 'staff'))
with check (public.current_app_role() in ('admin', 'staff'));

drop policy if exists content_blocks_staff_write on public.content_blocks;
create policy content_blocks_authenticated_read_all
on public.content_blocks for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));

drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_authenticated_read_all
on public.site_settings for select to authenticated
using (public.current_app_role() in ('admin', 'staff', 'viewer'));
create policy site_settings_admin_insert
on public.site_settings for insert to authenticated
with check (public.current_app_role() = 'admin');
create policy site_settings_admin_update
on public.site_settings for update to authenticated
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Audit only the tables that have Phase 2 client mutation policies.
create or replace function public.audit_cms_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  audit_row_id uuid;
  audit_metadata jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'site_settings' then
    audit_row_id := null;
    audit_metadata := jsonb_build_object('key', new.key);
  else
    audit_row_id := nullif(to_jsonb(new)->>'id', '')::uuid;
  end if;

  insert into public.audit_log (
    actor_id,
    action,
    table_name,
    row_id,
    metadata
  ) values (
    auth.uid(),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    audit_row_id,
    audit_metadata
  );

  return new;
end;
$$;

revoke all on function public.audit_cms_mutation() from public, anon, authenticated;

create trigger locations_cms_audit
after insert or update on public.locations
for each row execute function public.audit_cms_mutation();

create trigger unit_types_cms_audit
after insert or update on public.unit_types
for each row execute function public.audit_cms_mutation();

create trigger location_unit_types_cms_audit
after insert or update on public.location_unit_types
for each row execute function public.audit_cms_mutation();

create trigger media_assets_cms_audit
after insert or update on public.media_assets
for each row execute function public.audit_cms_mutation();

create trigger faqs_cms_audit
after insert or update on public.faqs
for each row execute function public.audit_cms_mutation();

create trigger blog_posts_cms_audit
after insert or update on public.blog_posts
for each row execute function public.audit_cms_mutation();

create trigger blog_translations_cms_audit
after insert or update on public.blog_translations
for each row execute function public.audit_cms_mutation();

create trigger site_settings_cms_audit
after insert or update on public.site_settings
for each row execute function public.audit_cms_mutation();
