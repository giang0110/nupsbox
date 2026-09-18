import {describe, expect, it} from 'vitest';
import {isCatalogFixtureMode} from '@/features/catalog/public-catalog-mode';

describe('catalog fixture mode', () => {
  it('allows deterministic fixtures only for absent or explicit CI placeholder URLs', () => {
    expect(isCatalogFixtureMode(undefined)).toBe(true);
    expect(isCatalogFixtureMode('')).toBe(true);
    expect(isCatalogFixtureMode('https://example.supabase.co')).toBe(true);
  });

  it('treats real and malformed configured URLs as non-fixture mode', () => {
    expect(isCatalogFixtureMode('https://veglohnmofzkgovedxkb.supabase.co')).toBe(false);
    expect(isCatalogFixtureMode('https://example.supabase.co.evil.test')).toBe(false);
    expect(isCatalogFixtureMode('not-a-url')).toBe(false);
  });
});
