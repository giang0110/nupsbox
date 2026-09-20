-- P3.34 consolidate overlapping permissive SELECT policies without changing effective access.

-- LOCATIONS
drop policy if exists locations_public_read on public.locations;
drop policy if exists locations_authenticated_read_all on public.locations;
create policy locations_public_read on public.locations
for select to anon
using (status = 'active');
create policy locations_authenticated_read on public.locations
for select to authenticated
using (
  status = 'active'
  or public.current_app_role() in ('admin','staff','viewer')
);

-- UNIT TYPES
drop policy if exists unit_types_public_read on public.unit_types;
drop policy if exists unit_types_authenticated_read_all on public.unit_types;
create policy unit_types_public_read on public.unit_types
for select to anon
using (active = true);
create policy unit_types_authenticated_read on public.unit_types
for select to authenticated
using (
  active = true
  or public.current_app_role() in ('admin','staff','viewer')
);

-- LOCATION × UNIT PRICING
drop policy if exists location_unit_types_public_read on public.location_unit_types;
drop policy if exists location_unit_types_authenticated_read_all on public.location_unit_types;
create policy location_unit_types_public_read on public.location_unit_types
for select to anon
using (
  exists (select 1 from public.locations l where l.id = location_id and l.status = 'active')
  and exists (select 1 from public.unit_types u where u.id = unit_type_id and u.active = true)
);
create policy location_unit_types_authenticated_read on public.location_unit_types
for select to authenticated
using (
  (
    exists (select 1 from public.locations l where l.id = location_id and l.status = 'active')
    and exists (select 1 from public.unit_types u where u.id = unit_type_id and u.active = true)
  )
  or public.current_app_role() in ('admin','staff','viewer')
);

-- MEDIA
drop policy if exists media_assets_public_read on public.media_assets;
drop policy if exists media_assets_authenticated_read_all on public.media_assets;
create policy media_assets_public_read on public.media_assets
for select to anon
using (is_public = true);
create policy media_assets_authenticated_read on public.media_assets
for select to authenticated
using (
  is_public = true
  or public.current_app_role() in ('admin','staff','viewer')
);

-- FAQ
drop policy if exists faqs_public_read on public.faqs;
drop policy if exists faqs_authenticated_read_all on public.faqs;
create policy faqs_public_read on public.faqs
for select to anon
using (active = true);
create policy faqs_authenticated_read on public.faqs
for select to authenticated
using (
  active = true
  or public.current_app_role() in ('admin','staff','viewer')
);

-- CONTENT BLOCKS
drop policy if exists content_blocks_public_read on public.content_blocks;
drop policy if exists content_blocks_authenticated_read_all on public.content_blocks;
create policy content_blocks_public_read on public.content_blocks
for select to anon
using (active = true);
create policy content_blocks_authenticated_read on public.content_blocks
for select to authenticated
using (
  active = true
  or public.current_app_role() in ('admin','staff','viewer')
);

-- BLOG POSTS
drop policy if exists blog_posts_public_read on public.blog_posts;
drop policy if exists blog_posts_authenticated_read_all on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts
for select to anon
using (status = 'published' and published_at <= now());
create policy blog_posts_authenticated_read on public.blog_posts
for select to authenticated
using (
  (status = 'published' and published_at <= now())
  or public.current_app_role() in ('admin','staff','viewer')
);

-- BLOG TRANSLATIONS
drop policy if exists blog_translations_public_read on public.blog_translations;
drop policy if exists blog_translations_authenticated_read_all on public.blog_translations;
create policy blog_translations_public_read on public.blog_translations
for select to anon
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_post_id and p.status = 'published' and p.published_at <= now()
  )
);
create policy blog_translations_authenticated_read on public.blog_translations
for select to authenticated
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_post_id and p.status = 'published' and p.published_at <= now()
  )
  or public.current_app_role() in ('admin','staff','viewer')
);

-- SITE SETTINGS
drop policy if exists site_settings_public_read on public.site_settings;
drop policy if exists site_settings_authenticated_read_all on public.site_settings;
create policy site_settings_public_read on public.site_settings
for select to anon
using (is_public = true);
create policy site_settings_authenticated_read on public.site_settings
for select to authenticated
using (
  is_public = true
  or public.current_app_role() in ('admin','staff','viewer')
);

-- PROFILES: preserve self-read, admin-read and operational assignee lookup in one policy.
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_read on public.profiles;
drop policy if exists profiles_operational_read on public.profiles;
create policy profiles_authenticated_read
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
  or (
    public.current_app_role() in ('admin','staff','viewer')
    and active = true
    and role in ('admin','staff')
  )
);
