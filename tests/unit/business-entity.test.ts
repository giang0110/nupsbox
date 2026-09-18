import {describe, expect, it} from 'vitest';
import {buildPublicBusinessEntity} from '@/features/seo/business-entity';
import type {PublicLocation} from '@/features/catalog/types';

const location: PublicLocation = {
  id: 'loc-1',
  slug: 'tan-phu',
  name: 'NupsBox Tân Phú',
  address: 'Approved address',
  district: 'Tân Phú',
  city: 'Ho Chi Minh City',
  latitude: null,
  longitude: null,
  phone: null,
  zaloUrl: null,
  openingHours: {},
  unitTypes: []
};

describe('public business structured data', () => {
  it('does not emit a postal address without a published location', () => {
    const entity = buildPublicBusinessEntity({
      origin: 'https://nupsbox.example',
      locale: 'vi',
      location: null,
      settings: {phone: null, email: null}
    });

    expect(entity['@type']).toBe('Organization');
    expect(entity).not.toHaveProperty('address');
  });

  it('uses published location data for LocalBusiness address', () => {
    const entity = buildPublicBusinessEntity({
      origin: 'https://nupsbox.example',
      locale: 'en',
      location,
      settings: {phone: '0900000000', email: 'hello@example.com'}
    });

    expect(entity['@type']).toBe('LocalBusiness');
    expect(entity).toMatchObject({
      telephone: '0900000000',
      email: 'hello@example.com',
      address: {
        streetAddress: 'Approved address',
        addressLocality: 'Tân Phú',
        addressRegion: 'Ho Chi Minh City',
        addressCountry: 'VN'
      }
    });
  });
});
