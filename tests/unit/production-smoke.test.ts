import {describe, expect, it} from 'vitest';
import {
  assertAppointmentCleanupTarget,
  assertLeadCleanupTarget,
  buildProductionAppointmentPayload,
  buildProductionLeadPayload,
  buildProductionSmokeMarker
} from '@/features/ops/production-smoke';

describe('production smoke guards', () => {
  it('builds a deterministic marker from a safe run id', () => {
    expect(buildProductionSmokeMarker('20260917T040000Z')).toBe('p24-smoke:20260917T040000Z');
  });

  it('rejects unsafe run ids', () => {
    expect(() => buildProductionSmokeMarker('')).toThrow('invalid_production_smoke_run_id');
    expect(() => buildProductionSmokeMarker('../prod')).toThrow('invalid_production_smoke_run_id');
  });

  it('builds a clearly synthetic lead payload', () => {
    expect(buildProductionLeadPayload('p24-smoke:abc123')).toMatchObject({
      fullName: 'P2.4 Production Smoke',
      phone: '00000000',
      preferredLanguage: 'vi',
      source: 'p24_production_smoke',
      utmCampaign: 'p24-smoke:abc123'
    });
  });

  it('builds a future pending viewing request payload', () => {
    const payload = buildProductionAppointmentPayload(
      'p24-smoke:abc123',
      new Date('2026-09-17T04:00:00.000Z')
    );
    expect(payload).toEqual({
      scheduledAt: '2026-09-17T06:00:00.000Z',
      durationMinutes: 30,
      customerNote: 'p24-smoke:abc123'
    });
  });

  it('allows cleanup only for the exact marked lead', () => {
    expect(() => assertLeadCleanupTarget(
      {id: 'lead-1', utm_campaign: 'p24-smoke:abc123'},
      'lead-1',
      'p24-smoke:abc123'
    )).not.toThrow();

    expect(() => assertLeadCleanupTarget(
      {id: 'lead-1', utm_campaign: 'different'},
      'lead-1',
      'p24-smoke:abc123'
    )).toThrow('unsafe_production_smoke_cleanup');
  });

  it('allows appointment cleanup only for exact id, lead, and marker note', () => {
    expect(() => assertAppointmentCleanupTarget(
      {id: 'appt-1', lead_id: 'lead-1', customer_note: 'p24-smoke:abc123'},
      'appt-1',
      'lead-1',
      'p24-smoke:abc123'
    )).not.toThrow();

    expect(() => assertAppointmentCleanupTarget(
      {id: 'appt-1', lead_id: 'other-lead', customer_note: 'p24-smoke:abc123'},
      'appt-1',
      'lead-1',
      'p24-smoke:abc123'
    )).toThrow('unsafe_production_smoke_cleanup');
  });
});
