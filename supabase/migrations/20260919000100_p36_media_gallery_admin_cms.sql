-- P3.6 Media Gallery & Admin CMS
-- Adds a public media bucket with staff/admin upload policies and optional blog source URL.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'nupsbox-media',
  'nupsbox-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists nupsbox_media_staff_insert on storage.objects;
create policy nupsbox_media_staff_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'nupsbox-media'
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists nupsbox_media_staff_update on storage.objects;
create policy nupsbox_media_staff_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'nupsbox-media'
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  bucket_id = 'nupsbox-media'
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists nupsbox_media_staff_delete on storage.objects;
create policy nupsbox_media_staff_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'nupsbox-media'
  and public.current_app_role() in ('admin', 'staff')
);

alter table public.blog_posts
  add column if not exists source_url text;

alter table public.blog_posts
  drop constraint if exists blog_posts_source_url_check;

alter table public.blog_posts
  add constraint blog_posts_source_url_check
  check (
    source_url is null
    or source_url ~* '^https?://'
  );
