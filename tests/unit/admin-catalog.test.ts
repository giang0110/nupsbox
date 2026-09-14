import {describe, expect, it} from 'vitest';
import {adminAvailabilityLabel, formatAdminPrice} from '@/features/admin/catalog';

describe('admin catalog presentation', () => {
  it('formats configured prices and keeps missing prices explicit', () => {
    expect(formatAdminPrice(1500000)).toContain('1.500.000');
    expect(formatAdminPrice(null)).toBe('Liên hệ');
  });

  it('uses neutral availability labels without claiming real-time inventory', () => {
    expect(adminAvailabilityLabel('available')).toBe('Có thể tư vấn');
    expect(adminAvailabilityLabel('limited')).toBe('Giới hạn');
    expect(adminAvailabilityLabel('sold_out')).toBe('Tạm hết');
    expect(adminAvailabilityLabel('contact')).toBe('Liên hệ xác nhận');
  });
});
