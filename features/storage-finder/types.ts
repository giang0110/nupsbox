export type StorageNeed = 'shop_online' | 'business' | 'inventory' | 'personal';
export type StorageVolume = 'under_20' | '20_50' | 'over_50' | 'unknown';

export type StorageFinderInput = {
  need: StorageNeed;
  volume: StorageVolume;
};

export type StorageCatalogItem = {
  id: string;
  slug: string;
  areaM2: number;
  sortOrder: number;
};

export type StorageRecommendation = {
  unit: StorageCatalogItem;
  explanation: 'compact-fit' | 'step-up' | 'largest-available' | 'consultation';
  needsConsultation: boolean;
  isFallback: boolean;
};
