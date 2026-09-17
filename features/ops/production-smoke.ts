type LeadCleanupRow = {
  id: string;
  utm_campaign: string | null;
};

type AppointmentCleanupRow = {
  id: string;
  lead_id: string;
  customer_note: string | null;
};

export function buildProductionSmokeMarker(runId: string): string {
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(runId)) {
    throw new Error('invalid_production_smoke_run_id');
  }

  return `p24-smoke:${runId}`;
}

export function buildProductionLeadPayload(marker: string): Record<string, unknown> {
  return {
    fullName: 'P2.4 Production Smoke',
    phone: '00000000',
    preferredLanguage: 'vi',
    needType: 'other',
    estimatedVolume: 'unknown',
    message: marker,
    source: 'p24_production_smoke',
    utmCampaign: marker,
    landingPage: '/p24-production-smoke'
  };
}

export function buildProductionAppointmentPayload(
  marker: string,
  now = new Date()
): Record<string, unknown> {
  return {
    scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    customerNote: marker
  };
}

export function assertLeadCleanupTarget(
  row: LeadCleanupRow | null,
  expectedId: string,
  marker: string
): void {
  if (!row || row.id !== expectedId || row.utm_campaign !== marker) {
    throw new Error('unsafe_production_smoke_cleanup');
  }
}

export function assertAppointmentCleanupTarget(
  row: AppointmentCleanupRow | null,
  expectedId: string,
  expectedLeadId: string,
  marker: string
): void {
  if (
    !row ||
    row.id !== expectedId ||
    row.lead_id !== expectedLeadId ||
    row.customer_note !== marker
  ) {
    throw new Error('unsafe_production_smoke_cleanup');
  }
}
