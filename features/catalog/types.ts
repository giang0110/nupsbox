import type {AvailabilityStatus} from '@/types/database';

export type PublicUnitType = {
  id: string;
  slug: string;
  name: string;
  areaM2: number;
  recommendedFor: string;
  capacityNote: string | null;
  monthlyPrice: number | null;
  promoPrice: number | null;
  availabilityStatus: AvailabilityStatus;
  availableCount: number | null;
  featured: boolean;
  sortOrder: number;
};

export type PublicLocation = {
  id: string;
  slug: string;
  name: string;
  address: string;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  zaloUrl: string | null;
  openingHours: Record<string, unknown>;
  unitTypes: PublicUnitType[];
};
