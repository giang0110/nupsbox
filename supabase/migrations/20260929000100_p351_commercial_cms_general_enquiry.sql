-- P3.51 Commercial CMS & General Enquiry
-- Reuses content_blocks for approved commercial website copy and adds
-- a structured enquiry category to the lightweight CRM.

alter table public.leads
  add column inquiry_type text not null default 'storage'
  constraint leads_inquiry_type_check check (
    inquiry_type in ('service_advice', 'quote', 'partnership', 'facility_info', 'storage', 'other')
  );

create index leads_inquiry_type_created_idx
on public.leads(inquiry_type, created_at desc);

-- content_blocks already exposes active rows publicly and authenticated rows to
-- operational users. P3.51 restores explicit staff/admin mutation policies
-- without reintroducing broad FOR ALL access.
create policy content_blocks_staff_insert
on public.content_blocks
for insert
to authenticated
with check ((select private.current_app_role()) in ('admin', 'staff'));

create policy content_blocks_staff_update
on public.content_blocks
for update
to authenticated
using ((select private.current_app_role()) in ('admin', 'staff'))
with check ((select private.current_app_role()) in ('admin', 'staff'));

create trigger content_blocks_cms_audit
after insert or update on public.content_blocks
for each row execute function public.audit_cms_mutation();

insert into public.content_blocks (
  page_key,
  block_key,
  content_vi,
  content_en,
  active,
  sort_order
) values
  (
    'commercial',
    'company_profile',
    '{"eyebrow":"THÔNG TIN THƯƠNG MẠI • TP.HCM","title":"NupsBox — hiểu dịch vụ trước khi quyết định.","description":"Khám phá giải pháp lưu trữ, cơ sở, hình ảnh thực tế và thông tin liên hệ của NupsBox. Website ưu tiên thông tin rõ ràng để bạn chủ động đánh giá trước khi trao đổi."}'::jsonb,
    '{"eyebrow":"COMMERCIAL INFORMATION • HO CHI MINH CITY","title":"NupsBox — understand the service before you decide.","description":"Explore NupsBox storage solutions, facilities, real imagery and contact information. The website prioritizes clear information so you can assess the service before getting in touch."}'::jsonb,
    true,
    10
  ),
  (
    'commercial',
    'services',
    '{"eyebrow":"DỊCH VỤ","title":"Dịch vụ và giải pháp lưu trữ NupsBox","description":"Khám phá các nhóm nhu cầu NupsBox đang phục vụ, sau đó xem thông tin cơ sở hoặc liên hệ để xác nhận phương án phù hợp."}'::jsonb,
    '{"eyebrow":"SERVICES","title":"NupsBox services and storage solutions","description":"Explore the needs NupsBox currently serves, then review facility information or contact us to confirm a suitable option."}'::jsonb,
    true,
    20
  ),
  (
    'commercial',
    'capabilities',
    '{"eyebrow":"CƠ SỞ & NĂNG LỰC","title":"Thông tin thực tế để đánh giá trước khi liên hệ.","description":"NupsBox công bố địa điểm, hình ảnh, quy mô và những dữ liệu vận hành đã được xác nhận; các nội dung cần xác nhận sẽ được ghi rõ."}'::jsonb,
    '{"eyebrow":"FACILITIES & CAPABILITY","title":"Practical information before you get in touch.","description":"NupsBox publishes verified location, imagery, sizing and operational information; anything requiring confirmation is clearly identified."}'::jsonb,
    true,
    30
  ),
  (
    'commercial',
    'commercial_cta',
    '{"eyebrow":"LIÊN HỆ THƯƠNG MẠI","title":"Cần thêm thông tin? Trao đổi trực tiếp với NupsBox.","description":"Gửi nhu cầu hoặc câu hỏi về dịch vụ, cơ sở, mức giá tham khảo và khả năng đáp ứng. NupsBox sẽ xác nhận thông tin phù hợp tại thời điểm liên hệ.","primaryLabel":"Liên hệ NupsBox","secondaryLabel":"Xem dịch vụ"}'::jsonb,
    '{"eyebrow":"COMMERCIAL ENQUIRIES","title":"Need more information? Talk directly with NupsBox.","description":"Send your requirements or questions about services, facilities, indicative pricing and availability. NupsBox will confirm the relevant information when you enquire.","primaryLabel":"Contact NupsBox","secondaryLabel":"View services"}'::jsonb,
    true,
    40
  ),
  (
    'commercial',
    'seo',
    '{"title":"Thông tin thương mại & giải pháp lưu trữ tại TP.HCM","description":"Website thông tin thương mại của NupsBox: dịch vụ lưu trữ, cơ sở, hình ảnh thực tế, bài viết và kênh liên hệ tại TP.HCM."}'::jsonb,
    '{"title":"Commercial information & storage solutions in Ho Chi Minh City","description":"NupsBox commercial information website covering storage services, facilities, real imagery, articles and contact channels in Ho Chi Minh City."}'::jsonb,
    true,
    50
  )
on conflict (page_key, block_key) do nothing;

create or replace function public.submit_public_lead_request(
  p_lead jsonb,
  p_appointment jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead_id uuid;
  v_appointment_id uuid;
  v_location_id uuid := nullif(p_lead->>'locationId', '')::uuid;
  v_unit_type_id uuid := nullif(p_lead->>'unitTypeId', '')::uuid;
begin
  if v_location_id is not null and not exists (
    select 1 from public.locations l
    where l.id = v_location_id and l.status = 'active'
  ) then
    raise exception 'invalid public location reference'
      using errcode = '23514';
  end if;

  if v_unit_type_id is not null and not exists (
    select 1 from public.unit_types u
    where u.id = v_unit_type_id and u.active = true
  ) then
    raise exception 'invalid public unit reference'
      using errcode = '23514';
  end if;

  if v_location_id is not null and v_unit_type_id is not null and not exists (
    select 1 from public.location_unit_types lut
    where lut.location_id = v_location_id
      and lut.unit_type_id = v_unit_type_id
  ) then
    raise exception 'invalid public location unit pair'
      using errcode = '23514';
  end if;

  insert into public.leads (
    full_name,
    phone,
    email,
    preferred_language,
    inquiry_type,
    location_id,
    unit_type_id,
    need_type,
    estimated_volume,
    message,
    source,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    landing_page,
    referrer,
    status
  ) values (
    trim(p_lead->>'fullName'),
    trim(p_lead->>'phone'),
    nullif(trim(p_lead->>'email'), ''),
    coalesce(nullif(p_lead->>'preferredLanguage', ''), 'vi'),
    coalesce(nullif(p_lead->>'inquiryType', ''), 'storage'),
    v_location_id,
    v_unit_type_id,
    coalesce(nullif(p_lead->>'needType', ''), 'other')::public.need_type,
    coalesce(nullif(p_lead->>'estimatedVolume', ''), 'unknown')::public.estimated_volume,
    nullif(p_lead->>'message', ''),
    coalesce(nullif(p_lead->>'source', ''), nullif(p_lead->>'utmSource', '')),
    nullif(p_lead->>'utmSource', ''),
    nullif(p_lead->>'utmMedium', ''),
    nullif(p_lead->>'utmCampaign', ''),
    nullif(p_lead->>'utmContent', ''),
    nullif(p_lead->>'landingPage', ''),
    nullif(p_lead->>'referrer', ''),
    'new'::public.lead_status
  ) returning id into v_lead_id;

  if p_appointment is not null then
    insert into public.lead_appointments (
      lead_id,
      location_id,
      unit_type_id,
      scheduled_at,
      duration_minutes,
      status,
      source,
      customer_note,
      created_by
    ) values (
      v_lead_id,
      v_location_id,
      v_unit_type_id,
      (p_appointment->>'scheduledAt')::timestamptz,
      coalesce((p_appointment->>'durationMinutes')::integer, 30),
      'pending',
      'customer',
      nullif(p_appointment->>'customerNote', ''),
      null
    ) returning id into v_appointment_id;
  end if;

  return jsonb_build_object(
    'lead_id', v_lead_id,
    'appointment_id', v_appointment_id
  );
end;
$$;

revoke all on function public.submit_public_lead_request(jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.submit_public_lead_request(jsonb, jsonb) to service_role;
