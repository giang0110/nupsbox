import type {AdminQualitySnapshot} from '@/features/admin/quality';
import type {AdminDashboardSummary} from '@/features/admin/dashboard';

export type PublicReadinessItem = {
  id: string;
  label: string;
  detail: string;
  ready: boolean;
  href: string;
  weight: number;
};

export type PublicReadiness = {
  items: PublicReadinessItem[];
  readyCount: number;
  totalCount: number;
  score: number;
  blockingCount: number;
};

export function buildPublicReadiness(
  snapshot: AdminQualitySnapshot,
  dashboard: AdminDashboardSummary
): PublicReadiness {
  const hasDirectContact = snapshot.contact.phone || snapshot.contact.zalo || snapshot.contact.facebook || snapshot.contact.email;
  const items: PublicReadinessItem[] = [
    {
      id: 'location',
      label: 'Địa điểm',
      detail: snapshot.catalog.activeLocations > 0 ? 'Đã có cơ sở active.' : 'Cần ít nhất 1 cơ sở active.',
      ready: snapshot.catalog.activeLocations > 0,
      href: '/admin/catalog/locations',
      weight: 2
    },
    {
      id: 'units',
      label: 'Loại kho',
      detail: snapshot.catalog.activeUnitTypes > 0 ? 'Đã có loại kho public.' : 'Finder và catalog cần ít nhất 1 loại kho active.',
      ready: snapshot.catalog.activeUnitTypes > 0,
      href: '/admin/catalog/unit-types',
      weight: 3
    },
    {
      id: 'pricing',
      label: 'Cấu hình giá',
      detail: snapshot.catalog.pricingRows > 0 ? 'Đã có mapping location × loại kho.' : 'Cần mapping location × loại kho; giá tiền có thể để Liên hệ.',
      ready: snapshot.catalog.pricingRows > 0,
      href: '/admin/catalog/pricing',
      weight: 2
    },
    {
      id: 'media',
      label: 'Ảnh public',
      detail: snapshot.media.publicCount > 0 ? 'Đã có ảnh thật public.' : 'Cần ảnh thật đã map location và bật public.',
      ready: snapshot.media.publicCount > 0,
      href: '/admin/content/media',
      weight: 2
    },
    {
      id: 'contact',
      label: 'Kênh liên hệ',
      detail: hasDirectContact ? 'Đã có ít nhất một kênh liên hệ public.' : 'Cần Phone, Zalo, Facebook hoặc email public.',
      ready: hasDirectContact,
      href: '/admin/content/settings',
      weight: 2
    },
    {
      id: 'faq',
      label: 'FAQ',
      detail: dashboard.health.faqs > 0 ? 'Đã có FAQ public.' : 'Nên có FAQ để giảm câu hỏi lặp lại trước khi khách liên hệ.',
      ready: dashboard.health.faqs > 0,
      href: '/admin/content/faq',
      weight: 1
    },
    {
      id: 'blog',
      label: 'Blog',
      detail: snapshot.blog.published > 0 ? 'Đã có nội dung SEO public.' : 'Chưa có blog public; đây không chặn conversion nhưng hạn chế SEO dài hạn.',
      ready: snapshot.blog.published > 0,
      href: '/admin/content/blog',
      weight: 1
    }
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const readyWeight = items.filter(item => item.ready).reduce((sum, item) => sum + item.weight, 0);

  return {
    items,
    readyCount: items.filter(item => item.ready).length,
    totalCount: items.length,
    score: totalWeight ? Math.round((readyWeight / totalWeight) * 100) : 0,
    blockingCount: items.filter(item => !item.ready && item.weight >= 2).length
  };
}
