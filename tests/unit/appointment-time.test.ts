import {describe, expect, it} from 'vitest';
import {hoChiMinhLocalToIso} from '@/features/appointments/time';

describe('Ho Chi Minh local appointment time', () => {
  it('converts datetime-local values from UTC+7 to ISO UTC', () => {
    expect(hoChiMinhLocalToIso('2026-09-20T09:30'))
      .toBe('2026-09-20T02:30:00.000Z');
  });

  it('rejects ambiguous non datetime-local input', () => {
    expect(() => hoChiMinhLocalToIso('20/09/2026 09:30'))
      .toThrow('invalid_local_datetime');
  });

  it('rejects impossible dates instead of normalizing them silently', () => {
    expect(() => hoChiMinhLocalToIso('2026-02-31T09:30'))
      .toThrow('invalid_local_datetime');
  });
});
