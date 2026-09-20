import {describe, expect, it} from 'vitest';
import {LocationInputSchema} from '@/features/admin/catalog-schemas';

const baseLocation = {
  slug: 'nupsbox-tan-phu',
  nameVi: 'NupsBox Tân Phú',
  nameEn: 'NupsBox Tan Phu',
  addressVi: '123 Đường A',
  addressEn: '123 A Street',
  district: 'Tân Phú',
  city: 'Ho Chi Minh City',
  latitude: '',
  longitude: '',
  phone: '0900000000',
  zaloUrl: '',
  openingHours: {},
  isFeatured: false,
  sortOrder: 0
};

describe('catalog input security', () => {
  it('accepts HTTPS Zalo links and blank values', () => {
    expect(LocationInputSchema.parse({...baseLocation, zaloUrl: 'https://zalo.me/0900000000'}).zaloUrl)
      .toBe('https://zalo.me/0900000000');
    expect(LocationInputSchema.parse(baseLocation).zaloUrl).toBeNull();
  });

  it('rejects executable or non-http URL schemes', () => {
    expect(LocationInputSchema.safeParse({...baseLocation, zaloUrl: 'javascript:alert(1)'}).success).toBe(false);
    expect(LocationInputSchema.safeParse({...baseLocation, zaloUrl: 'data:text/html,test'}).success).toBe(false);
  });

  it('bounds operational text fields', () => {
    expect(LocationInputSchema.safeParse({...baseLocation, addressVi: 'x'.repeat(501)}).success).toBe(false);
    expect(LocationInputSchema.safeParse({...baseLocation, phone: '1'.repeat(41)}).success).toBe(false);
  });
});
