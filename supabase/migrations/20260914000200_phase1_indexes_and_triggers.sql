create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger locations_set_updated_at before update on public.locations
for each row execute function public.set_updated_at();
create trigger unit_types_set_updated_at before update on public.unit_types
for each row execute function public.set_updated_at();
create trigger location_unit_types_set_updated_at before update on public.location_unit_types
for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();
create trigger faqs_set_updated_at before update on public.faqs
for each row execute function public.set_updated_at();
create trigger content_blocks_set_updated_at before update on public.content_blocks
for each row execute function public.set_updated_at();
create trigger blog_posts_set_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();
create trigger blog_translations_set_updated_at before update on public.blog_translations
for each row execute function public.set_updated_at();
create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

create index locations_slug_idx on public.locations(slug);
create index unit_types_slug_idx on public.unit_types(slug);
create index leads_created_at_idx on public.leads(created_at desc);
create index leads_status_created_at_idx on public.leads(status, created_at desc);
create index leads_location_id_idx on public.leads(location_id);
create index leads_unit_type_id_idx on public.leads(unit_type_id);
create index blog_posts_status_published_at_idx on public.blog_posts(status, published_at desc);
create index location_unit_types_location_idx on public.location_unit_types(location_id);
create index media_assets_location_idx on public.media_assets(location_id, category, sort_order);
create index lead_notes_lead_created_at_idx on public.lead_notes(lead_id, created_at desc);
create index lead_status_history_lead_created_at_idx on public.lead_status_history(lead_id, created_at desc);
