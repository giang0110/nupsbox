-- Verified development seed. Contact details and public prices intentionally remain unset
-- until NupsBox supplies approved production values.

insert into public.locations (
  slug, name_vi, name_en, address_vi, address_en, district, city, status, is_featured, sort_order
) values (
  'tan-phu',
  'NupsBox Tân Phú',
  'NupsBox Tan Phu',
  '1/1 Nguyễn Hữu Tiến, Tây Thạnh, Tân Phú, TP.HCM',
  '1/1 Nguyen Huu Tien, Tay Thanh, Tan Phu, Ho Chi Minh City',
  'Tân Phú',
  'Ho Chi Minh City',
  'active',
  true,
  10
) on conflict (slug) do nothing;

insert into public.unit_types (slug, name_vi, name_en, area_m2, sort_order)
values
  ('s', 'Kho S', 'Storage S', 1.64, 10),
  ('m', 'Kho M', 'Storage M', 5.43, 20)
on conflict (slug) do nothing;

insert into public.location_unit_types (
  location_id, unit_type_id, monthly_price, promo_price, availability_status, available_count, featured
)
select l.id, u.id, null, null, 'contact', null, u.slug = 's'
from public.locations l
cross join public.unit_types u
where l.slug = 'tan-phu' and u.slug in ('s', 'm')
on conflict (location_id, unit_type_id) do nothing;

insert into public.site_settings (key, value, is_public)
values (
  'public_contact',
  '{"phone": null, "zalo_url": null}'::jsonb,
  true
)
on conflict (key) do nothing;
