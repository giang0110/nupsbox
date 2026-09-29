import 'server-only';

import {createSupabaseServerClient} from '@/lib/supabase/server';

export const commercialBlockKeys = [
  'company_profile',
  'services',
  'service_shop_online',
  'service_small_business',
  'service_inventory',
  'service_personal',
  'capabilities',
  'commercial_cta',
  'seo',
  'seo_solutions',
  'seo_about',
  'seo_contact'
] as const;

export type CommercialBlockKey = (typeof commercialBlockKeys)[number];

export type CommercialCopy = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryLabel?: string;
  secondaryLabel?: string;
};

export type CommercialContent = {
  companyProfile: CommercialCopy;
  services: CommercialCopy;
  serviceGroups: {
    shopOnline: CommercialCopy;
    smallBusiness: CommercialCopy;
    inventory: CommercialCopy;
    personal: CommercialCopy;
  };
  capabilities: CommercialCopy;
  cta: CommercialCopy;
  seo: CommercialCopy;
  pageSeo: {
    solutions: CommercialCopy;
    about: CommercialCopy;
    contact: CommercialCopy;
  };
};

type Locale = 'vi' | 'en';

const defaults: Record<Locale, Record<CommercialBlockKey, CommercialCopy>> = {
  vi: {
    company_profile: {
      eyebrow: 'THÔNG TIN THƯƠNG MẠI • TP.HCM',
      title: 'NupsBox — hiểu dịch vụ trước khi quyết định.',
      description: 'Khám phá giải pháp lưu trữ, cơ sở, hình ảnh thực tế và thông tin liên hệ của NupsBox. Website ưu tiên thông tin rõ ràng để bạn chủ động đánh giá trước khi trao đổi.'
    },
    services: {
      eyebrow: 'DỊCH VỤ',
      title: 'Dịch vụ và giải pháp lưu trữ NupsBox',
      description: 'Khám phá các nhóm nhu cầu NupsBox đang phục vụ, sau đó xem thông tin cơ sở hoặc liên hệ để xác nhận phương án phù hợp.'
    },
    service_shop_online: {
      eyebrow: 'SHOP ONLINE',
      title: 'Kho cho shop online',
      description: 'Tách hàng khỏi không gian sống, giữ tồn kho gọn hơn và chủ động mở rộng khi lượng hàng thay đổi.'
    },
    service_small_business: {
      eyebrow: 'DOANH NGHIỆP NHỎ',
      title: 'Kho cho doanh nghiệp nhỏ',
      description: 'Bổ sung không gian cho hàng mẫu, thiết bị, tài liệu và tồn kho mà không cần mở rộng văn phòng.'
    },
    service_inventory: {
      eyebrow: 'CHỨA HÀNG',
      title: 'Không gian cho hàng tồn',
      description: 'Đưa hàng ít luân chuyển và vật dụng chưa cần dùng ra khỏi khu vực làm việc chính nhưng vẫn giữ khả năng tiếp cận.'
    },
    service_personal: {
      eyebrow: 'CÁ NHÂN',
      title: 'Kho cho nhu cầu cá nhân',
      description: 'Giải phóng diện tích nhà ở cho đồ theo mùa, đồ chuyển nhà hoặc tài sản chưa cần dùng thường xuyên.'
    },
    capabilities: {
      eyebrow: 'CƠ SỞ & NĂNG LỰC',
      title: 'Thông tin thực tế để đánh giá trước khi liên hệ.',
      description: 'NupsBox công bố địa điểm, hình ảnh, quy mô và những dữ liệu vận hành đã được xác nhận; các nội dung cần xác nhận sẽ được ghi rõ.'
    },
    commercial_cta: {
      eyebrow: 'LIÊN HỆ THƯƠNG MẠI',
      title: 'Cần thêm thông tin? Trao đổi trực tiếp với NupsBox.',
      description: 'Gửi nhu cầu hoặc câu hỏi về dịch vụ, cơ sở, mức giá tham khảo và khả năng đáp ứng. NupsBox sẽ xác nhận thông tin phù hợp tại thời điểm liên hệ.',
      primaryLabel: 'Liên hệ NupsBox',
      secondaryLabel: 'Xem dịch vụ'
    },
    seo: {
      title: 'Thông tin thương mại & giải pháp lưu trữ tại TP.HCM',
      description: 'Website thông tin thương mại của NupsBox: dịch vụ lưu trữ, cơ sở, hình ảnh thực tế, bài viết và kênh liên hệ tại TP.HCM.'
    },
    seo_solutions: {
      title: 'Dịch vụ & giải pháp lưu trữ tại TP.HCM',
      description: 'Khám phá các nhóm dịch vụ NupsBox cho shop online, doanh nghiệp nhỏ, hàng tồn và nhu cầu cá nhân tại TP.HCM.'
    },
    seo_about: {
      title: 'Về NupsBox | Thông tin doanh nghiệp',
      description: 'Tìm hiểu định hướng dịch vụ, cơ sở và cách NupsBox cung cấp thông tin thương mại minh bạch cho khách hàng tại TP.HCM.'
    },
    seo_contact: {
      title: 'Liên hệ NupsBox | Tư vấn, báo giá & hợp tác',
      description: 'Liên hệ NupsBox để hỏi về dịch vụ, báo giá, cơ sở, lưu trữ hoặc cơ hội hợp tác tại TP.HCM.'
    }
  },
  en: {
    company_profile: {
      eyebrow: 'COMMERCIAL INFORMATION • HO CHI MINH CITY',
      title: 'NupsBox — understand the service before you decide.',
      description: 'Explore NupsBox storage solutions, facilities, real imagery and contact information. The website prioritizes clear information so you can assess the service before getting in touch.'
    },
    services: {
      eyebrow: 'SERVICES',
      title: 'NupsBox services and storage solutions',
      description: 'Explore the needs NupsBox currently serves, then review facility information or contact us to confirm a suitable option.'
    },
    service_shop_online: {
      eyebrow: 'ONLINE SELLERS',
      title: 'Storage for online sellers',
      description: 'Separate inventory from living space, keep stock organized and scale storage as inventory changes.'
    },
    service_small_business: {
      eyebrow: 'SMALL BUSINESS',
      title: 'Storage for small businesses',
      description: 'Add room for samples, equipment, documents and inventory without expanding the office.'
    },
    service_inventory: {
      eyebrow: 'INVENTORY',
      title: 'Space for inventory',
      description: 'Move slower-moving stock and infrequently used items out of the main workspace while keeping them accessible.'
    },
    service_personal: {
      eyebrow: 'PERSONAL',
      title: 'Storage for personal needs',
      description: 'Free up living space for seasonal items, moving boxes or belongings that are not needed every day.'
    },
    capabilities: {
      eyebrow: 'FACILITIES & CAPABILITY',
      title: 'Practical information before you get in touch.',
      description: 'NupsBox publishes verified location, imagery, sizing and operational information; anything requiring confirmation is clearly identified.'
    },
    commercial_cta: {
      eyebrow: 'COMMERCIAL ENQUIRIES',
      title: 'Need more information? Talk directly with NupsBox.',
      description: 'Send your requirements or questions about services, facilities, indicative pricing and availability. NupsBox will confirm the relevant information when you enquire.',
      primaryLabel: 'Contact NupsBox',
      secondaryLabel: 'View services'
    },
    seo: {
      title: 'Commercial information & storage solutions in Ho Chi Minh City',
      description: 'NupsBox commercial information website covering storage services, facilities, real imagery, articles and contact channels in Ho Chi Minh City.'
    },
    seo_solutions: {
      title: 'Storage services & solutions in Ho Chi Minh City',
      description: 'Explore NupsBox services for online sellers, small businesses, inventory and personal storage needs in Ho Chi Minh City.'
    },
    seo_about: {
      title: 'About NupsBox | Company information',
      description: 'Learn about NupsBox, its service approach, facilities and transparent commercial information for customers in Ho Chi Minh City.'
    },
    seo_contact: {
      title: 'Contact NupsBox | Advice, quotes & partnerships',
      description: 'Contact NupsBox about services, quotes, facilities, storage requirements or partnership opportunities in Ho Chi Minh City.'
    }
  }
};

export function getCommercialDefaults(locale: Locale) {
  return defaults[locale];
}

export function getCommercialFallback(locale: Locale): CommercialContent {
  const fallback = defaults[locale];
  return {
    companyProfile: fallback.company_profile,
    services: fallback.services,
    serviceGroups: {
      shopOnline: fallback.service_shop_online,
      smallBusiness: fallback.service_small_business,
      inventory: fallback.service_inventory,
      personal: fallback.service_personal
    },
    capabilities: fallback.capabilities,
    cta: fallback.commercial_cta,
    seo: fallback.seo,
    pageSeo: {
      solutions: fallback.seo_solutions,
      about: fallback.seo_about,
      contact: fallback.seo_contact
    }
  };
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function projectCopy(value: unknown, fallback: CommercialCopy): CommercialCopy {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  return {
    eyebrow: text(source.eyebrow) ?? fallback.eyebrow,
    title: text(source.title) ?? fallback.title,
    description: text(source.description) ?? fallback.description,
    primaryLabel: text(source.primaryLabel) ?? fallback.primaryLabel,
    secondaryLabel: text(source.secondaryLabel) ?? fallback.secondaryLabel
  };
}

export async function getCommercialContent(locale: Locale): Promise<CommercialContent> {
  const fallback = defaults[locale];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!url || url.includes('example.supabase.co')) {
    return getCommercialFallback(locale);
  }

  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('content_blocks')
    .select('block_key, content_vi, content_en')
    .eq('page_key', 'commercial')
    .eq('active', true)
    .in('block_key', [...commercialBlockKeys])
    .order('sort_order', {ascending: true});

  if (error) return getCommercialFallback(locale);

  const rows = new Map(
    (data ?? []).map((row) => [
      row.block_key,
      locale === 'vi' ? row.content_vi : row.content_en
    ])
  );

  return {
    companyProfile: projectCopy(rows.get('company_profile'), fallback.company_profile),
    services: projectCopy(rows.get('services'), fallback.services),
    serviceGroups: {
      shopOnline: projectCopy(rows.get('service_shop_online'), fallback.service_shop_online),
      smallBusiness: projectCopy(rows.get('service_small_business'), fallback.service_small_business),
      inventory: projectCopy(rows.get('service_inventory'), fallback.service_inventory),
      personal: projectCopy(rows.get('service_personal'), fallback.service_personal)
    },
    capabilities: projectCopy(rows.get('capabilities'), fallback.capabilities),
    cta: projectCopy(rows.get('commercial_cta'), fallback.commercial_cta),
    seo: projectCopy(rows.get('seo'), fallback.seo),
    pageSeo: {
      solutions: projectCopy(rows.get('seo_solutions'), fallback.seo_solutions),
      about: projectCopy(rows.get('seo_about'), fallback.seo_about),
      contact: projectCopy(rows.get('seo_contact'), fallback.seo_contact)
    }
  };
}
