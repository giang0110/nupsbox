import {describe, expect, it} from 'vitest';
import {buildOptionalPublicAppointment} from '@/features/leads/public-booking';

describe('public booking request payload', () => {
  it('omits the appointment when viewing is not requested', () => {
    expect(buildOptionalPublicAppointment(false, '', '')).toBeUndefined();
  });

  it('converts Ho Chi Minh local viewing time to UTC and trims the note', () => {
    expect(buildOptionalPublicAppointment(true, '2026-09-20T09:30', '  Gọi trước 15 phút  ')).toEqual({
      scheduledAt: '2026-09-20T02:30:00.000Z',
      durationMinutes: 30,
      customerNote: 'Gọi trước 15 phút'
    });
  });

  it('rejects an enabled viewing request without a valid local time', () => {
    expect(() => buildOptionalPublicAppointment(true, '', '')).toThrow('invalid_appointment_time');
    expect(() => buildOptionalPublicAppointment(true, '2026-02-31T09:30', '')).toThrow('invalid_appointment_time');
  });
});
