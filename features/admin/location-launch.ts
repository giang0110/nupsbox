import type {AdminLocation} from '@/features/admin/locations';
import type {AdminMedia} from '@/features/admin/media';
import type {AdminPricing} from '@/features/admin/pricing';

export type LocationLaunchCheck = {
  id: 'publicMedia' | 'contact' | 'coordinates' | 'openingHours' | 'pricing';
  label: string;
  ready: boolean;
  required: boolean;
  detail: string;
};

export type LocationLaunchReadiness = {
  checks: LocationLaunchCheck[];
  qualityScore: number;
  publicMediaCount: number;
  pricingCount: number;
  recommendedNext: 'media' | 'pricing' | 'preview';
};

function hasOpeningHours(value: Record<string, unknown>) {
  return Object.keys(value).length > 0;
}

export function buildLocationLaunchReadiness(
  location: AdminLocation,
  media: AdminMedia[],
  pricing: AdminPricing[]
): LocationLaunchReadiness {
  const locationMedia = media.filter(item => item.locationId === location.id && item.isPublic);
  const locationPricing = pricing.filter(item => item.locationId === location.id);
  const hasContact = Boolean(location.phone?.trim() || location.zaloUrl?.trim());
  const hasCoordinates = location.latitude !== null && location.longitude !== null;

  const checks: LocationLaunchCheck[] = [
    {
      id: 'publicMedia',
      label: 'Ảnh public',
      ready: locationMedia.length > 0,
      required: false,
      detail: locationMedia.length > 0
        ? locationMedia.length + ' ảnh public đã gắn đúng cơ sở.'
        : 'Nên có ít nhất 1 ảnh thật public để gallery cơ sở xuất hiện.'
    },
    {
      id: 'contact',
      label: 'Liên hệ trực tiếp',
      ready: hasContact,
      required: false,
      detail: hasContact ? 'Đã có Phone hoặc Zalo.' : 'Nên bổ sung Phone hoặc Zalo nếu đã xác minh.'
    },
    {
      id: 'coordinates',
      label: 'Tọa độ',
      ready: hasCoordinates,
      required: false,
      detail: hasCoordinates ? 'Đã có latitude/longitude.' : 'Tọa độ chưa có; không chặn publish.'
    },
    {
      id: 'openingHours',
      label: 'Giờ mở cửa',
      ready: hasOpeningHours(location.openingHours),
      required: false,
      detail: hasOpeningHours(location.openingHours) ? 'Đã có dữ liệu giờ mở cửa.' : 'Chưa khai báo giờ mở cửa; không chặn publish.'
    },
    {
      id: 'pricing',
      label: 'Mapping giá',
      ready: locationPricing.length > 0,
      required: false,
      detail: locationPricing.length > 0
        ? locationPricing.length + ' mapping giá đang gắn với cơ sở.'
        : 'Chưa có mapping location × unit.'
    }
  ];

  const readyCount = checks.filter(check => check.ready).length;
  const qualityScore = Math.round((readyCount / checks.length) * 100);
  const recommendedNext = locationMedia.length === 0
    ? 'media'
    : locationPricing.length === 0
      ? 'pricing'
      : 'preview';

  return {
    checks,
    qualityScore,
    publicMediaCount: locationMedia.length,
    pricingCount: locationPricing.length,
    recommendedNext
  };
}
