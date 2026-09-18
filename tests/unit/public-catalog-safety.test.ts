import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {
  getActiveUnitTypes,
  getFeaturedLocation,
  getLocationBySlug,
  getUnitTypeBySlug
} = vi.hoisted(() => ({
  getActiveUnitTypes: vi.fn(),
  getFeaturedLocation: vi.fn(),
  getLocationBySlug: vi.fn(),
  getUnitTypeBySlug: vi.fn()
}));

vi.mock('server-only', () => ({}));
vi.mock('@/features/catalog/queries', () => ({
  getActiveUnitTypes,
  getFeaturedLocation,
  getLocationBySlug,
  getUnitTypeBySlug
}));

import {
  getMarketingFeaturedLocation,
  getMarketingLocationBySlug,
  getMarketingUnitBySlug,
  getMarketingUnits
} from '@/features/catalog/public-catalog';

describe('production catalog fact safety', () => {
  beforeEach(() => {
    vi.stubEnv(
      'NEXT_PUBLIC_SUPABASE_URL',
      'https://veglohnmofzkgovedxkb.supabase.co'
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not replace an empty real catalog with fixture units', async () => {
    getActiveUnitTypes.mockResolvedValue([]);

    await expect(getMarketingUnits('vi')).resolves.toEqual([]);
    expect(getActiveUnitTypes).toHaveBeenCalledTimes(1);
  });

  it('degrades real catalog read failures to empty/null instead of fixtures', async () => {
    getActiveUnitTypes.mockRejectedValue(new Error('database unavailable'));
    getFeaturedLocation.mockRejectedValue(new Error('database unavailable'));
    getUnitTypeBySlug.mockRejectedValue(new Error('database unavailable'));
    getLocationBySlug.mockRejectedValue(new Error('database unavailable'));

    await expect(getMarketingUnits('vi')).resolves.toEqual([]);
    await expect(getMarketingFeaturedLocation('vi')).resolves.toBeNull();
    await expect(getMarketingUnitBySlug('s', 'vi')).resolves.toBeNull();
    await expect(getMarketingLocationBySlug('tan-phu', 'vi')).resolves.toBeNull();
  });

  it('keeps deterministic fixtures for the explicit CI placeholder only', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');

    const units = await getMarketingUnits('vi');
    const location = await getMarketingFeaturedLocation('vi');

    expect(units.map((unit) => unit.slug)).toEqual(['s', 'm']);
    expect(location?.slug).toBe('tan-phu');
    expect(getActiveUnitTypes).not.toHaveBeenCalled();
    expect(getFeaturedLocation).not.toHaveBeenCalled();
  });
});
