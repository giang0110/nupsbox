drop policy if exists media_assets_admin_delete on public.media_assets;

create policy media_assets_admin_delete
on public.media_assets
for delete
to authenticated
using (current_app_role() = 'admin'::app_role);

drop policy if exists nupsbox_media_staff_delete on storage.objects;
drop policy if exists nupsbox_media_admin_delete on storage.objects;

create policy nupsbox_media_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'nupsbox-media'
  and current_app_role() = 'admin'::app_role
);
