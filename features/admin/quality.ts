import {createSupabaseServerClient} from '@/lib/supabase/server';

export type AdminQualityTone = 'danger' | 'warning' | 'info';
export type AdminQualityArea = 'public' | 'content' | 'crm';

export type AdminQualitySnapshot = {
  catalog: {
    totalLocations: number;
    activeLocations: number;
    totalUnitTypes: number;
    activeUnitTypes: number;
    pricingRows: number;
    pricingMissingMonthly: number;
  };
  media: {
    total: number;
    publicCount: number;
    missingAlt: number;
    unmappedLocation: number;
  };
  blog: {
    drafts: number;
    published: number;
    draftWithoutCover: number;
    draftWithoutSource: number;
  };
  contact: {
    phone: boolean;
    email: boolean;
    zalo: boolean;
    facebook: boolean;
  };
  crm: {
    newOver4h: number;
    unassignedOpen: number;
    staleOpen: number;
  };
};

export type AdminQualityIssue = {
  id: string;
  area: AdminQualityArea;
  tone: AdminQualityTone;
  title: string;
  detail: string;
  href: string;
  count?: number;
};

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function buildAdminQualityIssues(snapshot: AdminQualitySnapshot): AdminQualityIssue[] {
  const issues: AdminQualityIssue[] = [];

  if (snapshot.catalog.activeLocations === 0) {
    issues.push({
      id: 'active-location-missing',
      area: 'public',
      tone: 'danger',
      title: 'Chưa có địa điểm được công bố',
      detail: 'Website chưa thể hiển thị cơ sở từ dữ liệu production.',
      href: '/admin/catalog/locations'
    });
  }

  if (snapshot.catalog.activeUnitTypes === 0) {
    issues.push({
      id: 'active-unit-type-missing',
      area: 'public',
      tone: 'danger',
      title: 'Chưa có loại kho đang hoạt động',
      detail: 'Finder và catalog production chưa có loại kho để tư vấn.',
      href: '/admin/catalog/unit-types'
    });
  }

  if (snapshot.catalog.pricingRows === 0) {
    issues.push({
      id: 'pricing-missing',
      area: 'public',
      tone: 'warning',
      title: 'Chưa có cấu hình giá theo địa điểm',
      detail: 'Tạo mapping location × loại kho; giá chưa xác minh vẫn có thể để trống và hiển thị Liên hệ.',
      href: '/admin/catalog/pricing'
    });
  } else if (snapshot.catalog.pricingMissingMonthly > 0) {
    issues.push({
      id: 'pricing-contact-only',
      area: 'public',
      tone: 'info',
      title: 'Có cấu hình giá đang để Liên hệ',
      detail: 'Đây không phải lỗi nếu giá chưa được xác minh; chỉ cần rà lại trước khi công bố giá cụ thể.',
      href: '/admin/catalog/pricing',
      count: snapshot.catalog.pricingMissingMonthly
    });
  }

  if (!snapshot.contact.phone && !snapshot.contact.zalo) {
    issues.push({
      id: 'direct-contact-missing',
      area: 'public',
      tone: 'warning',
      title: 'Chưa có Phone hoặc Zalo công khai',
      detail: 'Facebook đã có thể làm kênh dự phòng, nhưng một kênh liên hệ trực tiếp sẽ giúp conversion tốt hơn.',
      href: '/admin/content/settings'
    });
  }

  if (!snapshot.contact.email) {
    issues.push({
      id: 'email-missing',
      area: 'public',
      tone: 'info',
      title: 'Chưa có email business công khai',
      detail: 'Bổ sung email nếu NupsBox muốn nhận yêu cầu hoặc đối tác liên hệ qua email.',
      href: '/admin/content/settings'
    });
  }

  if (snapshot.media.total === 0) {
    issues.push({
      id: 'media-empty',
      area: 'content',
      tone: 'warning',
      title: 'Chưa có hình ảnh kho trong Media CMS',
      detail: 'Upload ảnh thật, gắn đúng location và bật public để gallery homepage tự xuất hiện.',
      href: '/admin/content/media'
    });
  } else {
    if (snapshot.media.publicCount === 0) {
      issues.push({
        id: 'public-media-empty',
        area: 'content',
        tone: 'warning',
        title: 'Chưa có media được công khai',
        detail: 'Các file hiện có sẽ không xuất hiện trên website cho đến khi bật public.',
        href: '/admin/content/media'
      });
    }
    if (snapshot.media.missingAlt > 0) {
      issues.push({
        id: 'media-alt-incomplete',
        area: 'content',
        tone: 'warning',
        title: 'Media thiếu alt VI/EN',
        detail: 'Hoàn thiện alt text để đảm bảo accessibility và chất lượng SEO.',
        href: '/admin/content/media',
        count: snapshot.media.missingAlt
      });
    }
    if (snapshot.media.unmappedLocation > 0) {
      issues.push({
        id: 'media-location-unmapped',
        area: 'content',
        tone: 'warning',
        title: 'Media chưa gắn địa điểm',
        detail: 'Gallery kho chỉ dùng ảnh được map rõ ràng tới đúng location.',
        href: '/admin/content/media',
        count: snapshot.media.unmappedLocation
      });
    }
  }

  if (snapshot.blog.published === 0) {
    issues.push({
      id: 'published-blog-empty',
      area: 'content',
      tone: 'info',
      title: 'Chưa có bài blog được xuất bản',
      detail: 'Tạo bài giới thiệu/hướng dẫn và publish khi nội dung VI/EN đã hoàn chỉnh.',
      href: '/admin/content/blog'
    });
  }

  if (snapshot.blog.drafts > 0) {
    const missingAssets = snapshot.blog.draftWithoutCover;
    issues.push({
      id: 'blog-drafts',
      area: 'content',
      tone: missingAssets > 0 ? 'warning' : 'info',
      title: 'Có bài blog đang ở trạng thái draft',
      detail: missingAssets > 0
        ? 'Một số draft chưa có cover; rà nội dung, cover và nguồn giới thiệu trước khi publish.'
        : 'Rà nội dung song ngữ và publish khi đã sẵn sàng.',
      href: '/admin/content/blog',
      count: snapshot.blog.drafts
    });
  }

  if (snapshot.crm.newOver4h > 0) {
    issues.push({
      id: 'new-leads-over-4h',
      area: 'crm',
      tone: 'danger',
      title: 'Lead mới quá 4 giờ chưa chuyển trạng thái',
      detail: 'Ưu tiên liên hệ và cập nhật trạng thái CRM để không bỏ sót yêu cầu.',
      href: '/admin/leads?status=new',
      count: snapshot.crm.newOver4h
    });
  }

  if (snapshot.crm.unassignedOpen > 0) {
    issues.push({
      id: 'open-leads-unassigned',
      area: 'crm',
      tone: 'warning',
      title: 'Lead đang mở chưa có người phụ trách',
      detail: 'Phân công owner cho lead đang xử lý để rõ trách nhiệm follow-up.',
      href: '/admin/leads',
      count: snapshot.crm.unassignedOpen
    });
  }

  if (snapshot.crm.staleOpen > 0) {
    issues.push({
      id: 'stale-open-leads',
      area: 'crm',
      tone: 'warning',
      title: 'Lead đang xử lý không cập nhật quá 3 ngày',
      detail: 'Rà lại trạng thái, ghi chú hoặc bước tiếp theo của các lead này.',
      href: '/admin/leads',
      count: snapshot.crm.staleOpen
    });
  }

  const toneOrder: Record<AdminQualityTone, number> = {danger: 0, warning: 1, info: 2};
  return issues.sort((a, b) => toneOrder[a.tone] - toneOrder[b.tone]);
}

export async function getAdminQualitySnapshot(now = new Date()): Promise<AdminQualitySnapshot> {
  const supabase = await createSupabaseServerClient();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const [
    locationsResult,
    unitsResult,
    pricingResult,
    mediaResult,
    blogResult,
    settingsResult,
    newOver4hResult,
    unassignedResult,
    staleResult
  ] = await Promise.all([
    supabase.from('locations').select('id, status'),
    supabase.from('unit_types').select('id, active'),
    supabase.from('location_unit_types').select('id, monthly_price'),
    supabase.from('media_assets').select('id, is_public, alt_vi, alt_en, location_id'),
    supabase.from('blog_posts').select('id, status, cover_media_id, source_url'),
    supabase.from('site_settings').select('value').eq('key', 'public_contact').maybeSingle(),
    supabase
      .from('leads')
      .select('*', {count: 'exact', head: true})
      .eq('status', 'new')
      .lt('created_at', fourHoursAgo),
    supabase
      .from('leads')
      .select('*', {count: 'exact', head: true})
      .in('status', ['new', 'contacted', 'qualified', 'viewing', 'negotiating'])
      .is('assigned_to', null),
    supabase
      .from('leads')
      .select('*', {count: 'exact', head: true})
      .in('status', ['contacted', 'qualified', 'viewing', 'negotiating'])
      .lt('updated_at', threeDaysAgo)
  ]);

  const firstError = [
    locationsResult.error,
    unitsResult.error,
    pricingResult.error,
    mediaResult.error,
    blogResult.error,
    settingsResult.error,
    newOver4hResult.error,
    unassignedResult.error,
    staleResult.error
  ].find(Boolean);
  if (firstError) throw firstError;

  const locations = locationsResult.data ?? [];
  const units = unitsResult.data ?? [];
  const pricing = pricingResult.data ?? [];
  const media = mediaResult.data ?? [];
  const blogs = blogResult.data ?? [];
  const contact = recordValue(settingsResult.data?.value);

  return {
    catalog: {
      totalLocations: locations.length,
      activeLocations: locations.filter(row => row.status === 'active').length,
      totalUnitTypes: units.length,
      activeUnitTypes: units.filter(row => row.active).length,
      pricingRows: pricing.length,
      pricingMissingMonthly: pricing.filter(row => row.monthly_price == null).length
    },
    media: {
      total: media.length,
      publicCount: media.filter(row => row.is_public).length,
      missingAlt: media.filter(row => !hasText(row.alt_vi) || !hasText(row.alt_en)).length,
      unmappedLocation: media.filter(row => row.location_id == null).length
    },
    blog: {
      drafts: blogs.filter(row => row.status === 'draft').length,
      published: blogs.filter(row => row.status === 'published').length,
      draftWithoutCover: blogs.filter(row => row.status === 'draft' && row.cover_media_id == null).length,
      draftWithoutSource: blogs.filter(row => row.status === 'draft' && row.source_url == null).length
    },
    contact: {
      phone: hasText(contact.phone),
      email: hasText(contact.email),
      zalo: hasText(contact.zalo_url),
      facebook: hasText(contact.facebook_url)
    },
    crm: {
      newOver4h: newOver4hResult.count ?? 0,
      unassignedOpen: unassignedResult.count ?? 0,
      staleOpen: staleResult.count ?? 0
    }
  };
}
