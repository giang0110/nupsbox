import type {ConversionContext} from '@/features/marketing/conversion';
import type {StorageFinderInput, StorageRecommendation} from './types';

export function buildFinderConversionContext(
  input: StorageFinderInput,
  recommendation: StorageRecommendation
): ConversionContext {
  return {
    need: input.need,
    volume: input.volume,
    unitSlug: recommendation.unit.slug,
    unitId: recommendation.unit.id
  };
}
