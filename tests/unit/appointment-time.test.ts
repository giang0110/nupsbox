import {describe, expect, it} from 'vitest';
import {hoChiMinhLocalToIso} from '@/features/appointments/time';

describe('hoChiMinhLocalToIso', () => {
  it('converts a Ho Chi Minh local date-time to UTC ISO', () => {
    expect(hoChiMinhLocalToIso('2026-09-20T09:30'))
      .toBe('2026-09-20T02:30:00.000Z');
  });

  it('rejects non-local date-time input', () => {
    expect(() => hoChiMinhLocalToIso('20/09/2026 09:30'))
      .toThrow('invalid_local_datetime');
  });
});
