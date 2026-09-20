import type {AdminCatalog} from '@/features/admin/catalog';

export type CatalogLaunchStep = {
  id: 'location' | 'unit' | 'pricing' | 'preview';
  label: string;
  detail: string;
  href: string;
  ready: boolean;
  current: boolean;
};

export type CatalogLaunchReadiness = {
  steps: CatalogLaunchStep[];
  readyCount: number;
  totalCount: number;
  score: number;
  nextHref: string;
  nextLabel: string;
};

export function buildCatalogLaunchReadiness(catalog: AdminCatalog): CatalogLaunchReadiness {
  const activeLocations = catalog.locations.filter(location => location.status === 'active');
  const activeUnits = catalog.unitTypes.filter(unit => unit.active);
  const activeLocationIds = new Set(activeLocations.map(location => location.id));
  const activeUnitIds = new Set(activeUnits.map(unit => unit.id));
  const usablePricing = catalog.pricing.filter(row =>
    activeLocationIds.has(row.locationId) && activeUnitIds.has(row.unitTypeId)
  );

  const readiness = {
    location: activeLocations.length > 0,
    unit: activeUnits.length > 0,
    pricing: usablePricing.length > 0,
    preview: activeLocations.length > 0 && activeUnits.length > 0 && usablePricing.length > 0
  };

  const order: Array<CatalogLaunchStep['id']> = ['location', 'unit', 'pricing', 'preview'];
  const firstMissing = order.find(id => !readiness[id]) ?? 'preview';

  const steps: CatalogLaunchStep[] = [
    {
      id: 'location',
      label: '1. Địa điểm',
      detail: readiness.location
        ? activeLocations.length + ' cơ sở đang active.'
        : 'Cần ít nhất 1 cơ sở active trước khi đưa catalog ra public.',
      href: '/admin/catalog/locations',
      ready: readiness.location,
      current: firstMissing === 'location'
    },
    {
      id: 'unit',
      label: '2. Loại kho',
      detail: readiness.unit
        ? activeUnits.length + ' loại kho đang active.'
        : 'Tạo loại kho, hoàn thiện nội dung song ngữ và publish.',
      href: '/admin/catalog/unit-types',
      ready: readiness.unit,
      current: firstMissing === 'unit'
    },
    {
      id: 'pricing',
      label: '3. Mapping giá',
      detail: readiness.pricing
        ? usablePricing.length + ' mapping active location × active unit.'
        : 'Gắn loại kho vào địa điểm; giá tiền có thể để trống nếu chưa xác minh.',
      href: '/admin/catalog/pricing',
      ready: readiness.pricing,
      current: firstMissing === 'pricing'
    },
    {
      id: 'preview',
      label: '4. Preview public',
      detail: readiness.preview
        ? 'Catalog đã đủ dữ liệu cốt lõi để rà trên website public.'
        : 'Preview chỉ có ý nghĩa sau khi location, unit và mapping đã sẵn sàng.',
      href: '/kho-mini',
      ready: readiness.preview,
      current: firstMissing === 'preview'
    }
  ];

  const readyCount = steps.filter(step => step.ready).length;
  const score = Math.round((readyCount / steps.length) * 100);
  const next = steps.find(step => step.current) ?? steps[steps.length - 1];

  return {
    steps,
    readyCount,
    totalCount: steps.length,
    score,
    nextHref: next.href,
    nextLabel: next.label
  };
}
