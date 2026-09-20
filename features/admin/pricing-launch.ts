import type {AdminLocation} from '@/features/admin/locations';
import type {AdminPricing} from '@/features/admin/pricing';
import type {AdminUnitType} from '@/features/admin/unit-types';

export type PricingLaunchSummary = {
  activeLocations: number;
  activeUnits: number;
  totalMappings: number;
  usableMappings: number;
  contactOnlyMappings: number;
  verifiedPriceMappings: number;
  missingPairs: number;
  score: number;
  ready: boolean;
};

export function pricingPairKey(locationId: string, unitTypeId: string) {
  return locationId + ':' + unitTypeId;
}

export function summarizePricingLaunch(
  locations: AdminLocation[],
  units: AdminUnitType[],
  pricing: AdminPricing[]
): PricingLaunchSummary {
  const activeLocations = locations.filter(location => location.status === 'active');
  const activeUnits = units.filter(unit => unit.active);
  const activeLocationIds = new Set(activeLocations.map(location => location.id));
  const activeUnitIds = new Set(activeUnits.map(unit => unit.id));

  const usable = pricing.filter(row =>
    activeLocationIds.has(row.locationId) && activeUnitIds.has(row.unitTypeId)
  );

  const existingPairs = new Set(
    usable.map(row => pricingPairKey(row.locationId, row.unitTypeId))
  );
  const totalExpectedPairs = activeLocations.length * activeUnits.length;
  const missingPairs = Math.max(totalExpectedPairs - existingPairs.size, 0);
  const verifiedPriceMappings = usable.filter(row => row.monthlyPrice !== null).length;
  const contactOnlyMappings = usable.filter(row => row.monthlyPrice === null).length;

  const prerequisitesReady = activeLocations.length > 0 && activeUnits.length > 0;
  const mappingReady = prerequisitesReady && usable.length > 0;
  const score = !prerequisitesReady
    ? 0
    : mappingReady
      ? Math.round((existingPairs.size / Math.max(totalExpectedPairs, 1)) * 100)
      : 0;

  return {
    activeLocations: activeLocations.length,
    activeUnits: activeUnits.length,
    totalMappings: pricing.length,
    usableMappings: usable.length,
    contactOnlyMappings,
    verifiedPriceMappings,
    missingPairs,
    score,
    ready: mappingReady
  };
}
