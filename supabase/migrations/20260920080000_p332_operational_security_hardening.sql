-- P3.32 operational security and performance hardening.
-- All statements are additive or least-privilege changes; no business data is modified.

create index if not exists audit_log_actor_id_idx
  on public.audit_log(actor_id);

create index if not exists blog_posts_author_id_idx
  on public.blog_posts(author_id);

create index if not exists blog_posts_cover_media_id_idx
  on public.blog_posts(cover_media_id);

create index if not exists lead_appointment_history_changed_by_idx
  on public.lead_appointment_history(changed_by);

create index if not exists lead_appointment_history_lead_id_idx
  on public.lead_appointment_history(lead_id);

create index if not exists lead_appointments_created_by_idx
  on public.lead_appointments(created_by);

create index if not exists lead_appointments_location_id_idx
  on public.lead_appointments(location_id);

create index if not exists lead_appointments_unit_type_id_idx
  on public.lead_appointments(unit_type_id);

create index if not exists lead_notes_author_id_idx
  on public.lead_notes(author_id);

create index if not exists lead_status_history_changed_by_idx
  on public.lead_status_history(changed_by);

create index if not exists location_unit_types_unit_type_id_idx
  on public.location_unit_types(unit_type_id);

create index if not exists media_assets_unit_type_id_idx
  on public.media_assets(unit_type_id);

create index if not exists site_settings_updated_by_idx
  on public.site_settings(updated_by);

-- Evaluate auth.uid() once per statement rather than once per row.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

-- Rate-limit state is server-only. RLS already denies client access; revoke table
-- privileges as a second boundary so an accidental future policy cannot expose it.
revoke all privileges on table public.lead_rate_limits from anon, authenticated;
