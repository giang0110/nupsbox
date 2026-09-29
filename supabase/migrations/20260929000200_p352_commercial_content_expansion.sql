-- P3.52 Commercial Content Expansion & Conversion Analytics
-- Adds fixed commercial content blocks only. No schema or RLS changes.

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
    'service_shop_online',
    '{"eyebrow":"SHOP ONLINE","title":"Kho cho shop online","description":"Tách hàng khỏi không gian sống, giữ tồn kho gọn hơn và chủ động mở rộng khi lượng hàng thay đổi."}'::jsonb,
    '{"eyebrow":"ONLINE SELLERS","title":"Storage for online sellers","description":"Separate inventory from living space, keep stock organized and scale storage as inventory changes."}'::jsonb,
    true,
    21
  ),
  (
    'commercial',
    'service_small_business',
    '{"eyebrow":"DOANH NGHIỆP NHỎ","title":"Kho cho doanh nghiệp nhỏ","description":"Bổ sung không gian cho hàng mẫu, thiết bị, tài liệu và tồn kho mà không cần mở rộng văn phòng."}'::jsonb,
    '{"eyebrow":"SMALL BUSINESS","title":"Storage for small businesses","description":"Add room for samples, equipment, documents and inventory without expanding the office."}'::jsonb,
    true,
    22
  ),
  (
    'commercial',
    'service_inventory',
    '{"eyebrow":"CHỨA HÀNG","title":"Không gian cho hàng tồn","description":"Đưa hàng ít luân chuyển và vật dụng chưa cần dùng ra khỏi khu vực làm việc chính nhưng vẫn giữ khả năng tiếp cận."}'::jsonb,
    '{"eyebrow":"INVENTORY","title":"Space for inventory","description":"Move slower-moving stock and infrequently used items out of the main workspace while keeping them accessible."}'::jsonb,
    true,
    23
  ),
  (
    'commercial',
    'service_personal',
    '{"eyebrow":"CÁ NHÂN","title":"Kho cho nhu cầu cá nhân","description":"Giải phóng diện tích nhà ở cho đồ theo mùa, đồ chuyển nhà hoặc tài sản chưa cần dùng thường xuyên."}'::jsonb,
    '{"eyebrow":"PERSONAL","title":"Storage for personal needs","description":"Free up living space for seasonal items, moving boxes or belongings that are not needed every day."}'::jsonb,
    true,
    24
  ),
  (
    'commercial',
    'seo_solutions',
    '{"title":"Dịch vụ & giải pháp lưu trữ tại TP.HCM","description":"Khám phá các nhóm dịch vụ NupsBox cho shop online, doanh nghiệp nhỏ, hàng tồn và nhu cầu cá nhân tại TP.HCM."}'::jsonb,
    '{"title":"Storage services & solutions in Ho Chi Minh City","description":"Explore NupsBox services for online sellers, small businesses, inventory and personal storage needs in Ho Chi Minh City."}'::jsonb,
    true,
    51
  ),
  (
    'commercial',
    'seo_about',
    '{"title":"Về NupsBox | Thông tin doanh nghiệp","description":"Tìm hiểu định hướng dịch vụ, cơ sở và cách NupsBox cung cấp thông tin thương mại minh bạch cho khách hàng tại TP.HCM."}'::jsonb,
    '{"title":"About NupsBox | Company information","description":"Learn about NupsBox, its service approach, facilities and transparent commercial information for customers in Ho Chi Minh City."}'::jsonb,
    true,
    52
  ),
  (
    'commercial',
    'seo_contact',
    '{"title":"Liên hệ NupsBox | Tư vấn, báo giá & hợp tác","description":"Liên hệ NupsBox để hỏi về dịch vụ, báo giá, cơ sở, lưu trữ hoặc cơ hội hợp tác tại TP.HCM."}'::jsonb,
    '{"title":"Contact NupsBox | Advice, quotes & partnerships","description":"Contact NupsBox about services, quotes, facilities, storage requirements or partnership opportunities in Ho Chi Minh City."}'::jsonb,
    true,
    53
  )
on conflict (page_key, block_key) do nothing;
