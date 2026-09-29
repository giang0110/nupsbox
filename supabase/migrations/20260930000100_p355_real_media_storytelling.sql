-- P3.55 Real Media & Commercial Storytelling
-- Adds explicit media-to-editorial mappings without changing media asset ownership.

create table public.media_editorial_links (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  context_type text not null check (context_type in ('blog', 'solution', 'topic')),
  context_key text not null check (
    context_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and length(context_key) <= 180
  ),
  role text not null default 'gallery' check (role in ('feature', 'inline', 'gallery')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (media_id, context_type, context_key, role)
);

create index media_editorial_links_context_idx
on public.media_editorial_links(context_type, context_key, role, sort_order, created_at);

create index media_editorial_links_media_idx
on public.media_editorial_links(media_id);

create trigger media_editorial_links_set_updated_at
before update on public.media_editorial_links
for each row execute function public.set_updated_at();

alter table public.media_editorial_links enable row level security;

create policy media_editorial_links_public_read
on public.media_editorial_links
for select to anon
using (
  exists (
    select 1
    from public.media_assets m
    where m.id = media_id
      and m.is_public = true
  )
);

create policy media_editorial_links_authenticated_read
on public.media_editorial_links
for select to authenticated
using (
  exists (
    select 1
    from public.media_assets m
    where m.id = media_id
      and m.is_public = true
  )
  or (select private.current_app_role()) in ('admin', 'staff', 'viewer')
);

create policy media_editorial_links_staff_insert
on public.media_editorial_links
for insert to authenticated
with check ((select private.current_app_role()) in ('admin', 'staff'));

create policy media_editorial_links_staff_update
on public.media_editorial_links
for update to authenticated
using ((select private.current_app_role()) in ('admin', 'staff'))
with check ((select private.current_app_role()) in ('admin', 'staff'));

create policy media_editorial_links_staff_delete
on public.media_editorial_links
for delete to authenticated
using ((select private.current_app_role()) in ('admin', 'staff'));

grant select on public.media_editorial_links to anon, authenticated;
grant insert, update, delete on public.media_editorial_links to authenticated;

create trigger media_editorial_links_cms_audit
after insert or update on public.media_editorial_links
for each row execute function public.audit_cms_mutation();

-- Seed only from already-public, already-classified assets.
-- A clean/local DB with no media receives zero seed rows.
with ranked_media as (
  select
    id,
    category::text as category,
    row_number() over (
      partition by category
      order by sort_order asc, created_at asc, id asc
    ) as ordinal
  from public.media_assets
  where is_public = true
),
seed(context_type, context_key, role, category, ordinal, sort_order) as (
  values
    ('solution', 'shop-online', 'feature', 'lifestyle', 1, 10),
    ('solution', 'small-business', 'feature', 'location', 1, 10),
    ('solution', 'inventory', 'feature', 'unit', 1, 10),
    ('solution', 'personal', 'feature', 'lifestyle', 2, 10),

    ('blog', 'chon-dien-tich-kho-mini', 'inline', 'unit', 1, 10),
    ('blog', 'sap-xep-kho-shop-online', 'inline', 'lifestyle', 1, 10),
    ('blog', 'kho-cho-shop-online-tu-nha-ra-kho-rieng', 'inline', 'hero', 1, 10),
    ('blog', 'kho-hay-mo-rong-van-phong', 'inline', 'location', 1, 10),
    ('blog', 'quan-ly-hang-ton-cham-luan-chuyen', 'inline', 'unit', 1, 10),
    ('blog', 'kho-ca-nhan-chuyen-nha-sua-nha', 'inline', 'lifestyle', 2, 10)
)
insert into public.media_editorial_links (
  media_id,
  context_type,
  context_key,
  role,
  sort_order
)
select
  media.id,
  seed.context_type,
  seed.context_key,
  seed.role,
  seed.sort_order
from seed
join ranked_media media
  on media.category = seed.category
 and media.ordinal = seed.ordinal
on conflict (media_id, context_type, context_key, role) do nothing;
