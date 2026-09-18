export type FacilityMedia = {
  imageUrl: string;
};

const facilityMediaBySlug: Record<string, FacilityMedia> = {
  'tan-phu': {
    imageUrl:
      'https://siaodieqxzlarnvfppox.supabase.co/storage/v1/object/public/onboarding-photos/nupsbox-tan-phu/corridor-1.jpg'
  }
};

export function getFacilityMedia(locationSlug: string | null | undefined): FacilityMedia | null {
  if (!locationSlug) return null;
  return facilityMediaBySlug[locationSlug] ?? null;
}
