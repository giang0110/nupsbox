import {volumeRule} from './rules';
import type {StorageCatalogItem, StorageFinderInput, StorageRecommendation} from './types';

export function recommendStorage(
  input: StorageFinderInput,
  catalog: readonly StorageCatalogItem[]
): StorageRecommendation {
  if (catalog.length === 0) throw new Error('Storage catalog is empty');

  const sorted = [...catalog].sort((a, b) => a.sortOrder - b.sortOrder || a.areaM2 - b.areaM2);
  const rule = volumeRule[input.volume];
  const preferredIndex = Number.isFinite(rule.preferredIndex) ? rule.preferredIndex : sorted.length - 1;
  const boundedIndex = Math.min(preferredIndex, sorted.length - 1);
  const isFallback = preferredIndex >= sorted.length;
  const needsConsultation = rule.consult || isFallback;

  let explanation: StorageRecommendation['explanation'];
  if (input.volume === 'unknown') explanation = 'consultation';
  else if (input.volume === 'over_50') explanation = 'largest-available';
  else if (boundedIndex === 0) explanation = 'compact-fit';
  else explanation = 'step-up';

  return {
    unit: sorted[boundedIndex],
    explanation,
    needsConsultation,
    isFallback
  };
}
