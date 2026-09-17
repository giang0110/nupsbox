import {expect, test} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {
  assertAppointmentCleanupTarget,
  assertLeadCleanupTarget,
  buildProductionAppointmentPayload,
  buildProductionLeadPayload,
  buildProductionSmokeMarker
} from '@/features/ops/production-smoke';
import type {DatabaseWithAppointments} from '@/types/appointment-database';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const runId = process.env.PRODUCTION_SMOKE_RUN_ID;

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!runId) throw new Error('Missing PRODUCTION_SMOKE_RUN_ID');

const marker = buildProductionSmokeMarker(runId);
const bookingMarker = `${marker}:booking`;
const atomicMarker = `${marker}:atomic`;

const supabase = createClient<DatabaseWithAppointments>(supabaseUrl, serviceRoleKey, {
  auth: {persistSession: false, autoRefreshToken: false}
});

const createdLeadIds: Array<{id: string; marker: string}> = [];
const createdAppointments: Array<{id: string; leadId: string; marker: string}> = [];

function throwOnError(error: {message?: string} | null, context: string): void {
  if (error) {
    throw new Error(`${context}: ${error.message ?? 'unknown_error'}`);
  }
}

test.describe.serial('P2.4 production lead and booking smoke', () => {
  test('invalid public input returns 400 and creates no marked rows', async ({request}) => {
    const response = await request.post('/api/leads', {
      data: {
        ...buildProductionLeadPayload(marker),
        phone: 'bad-phone'
      }
    });

    expect(response.status()).toBe(400);

    const {count, error} = await supabase
      .from('leads')
      .select('id', {count: 'exact', head: true})
      .eq('utm_campaign', marker);

    expect(error).toBeNull();
    expect(count).toBe(0);
  });

  test('valid lead-only request creates exactly one marked lead', async ({request}) => {
    const response = await request.post('/api/leads', {
      data: buildProductionLeadPayload(marker)
    });

    expect(response.status()).toBe(201);
    const body = await response.json() as {
      ok?: boolean;
      leadId?: string;
      appointmentId?: string | null;
    };

    expect(body.ok).toBe(true);
    expect(body.leadId).toBeTruthy();
    expect(body.appointmentId).toBeNull();

    const leadId = body.leadId as string;
    const {data: lead, error} = await supabase
      .from('leads')
      .select('id, utm_campaign, source')
      .eq('id', leadId)
      .single();

    expect(error).toBeNull();
    expect(lead).toMatchObject({
      id: leadId,
      utm_campaign: marker,
      source: 'p24_production_smoke'
    });

    createdLeadIds.push({id: leadId, marker});
  });

  test('valid lead plus appointment creates pending customer appointment and created history', async ({request}) => {
    const leadPayload = {
      ...buildProductionLeadPayload(bookingMarker),
      phone: '00000001',
      message: bookingMarker,
      utmCampaign: bookingMarker,
      appointment: buildProductionAppointmentPayload(bookingMarker)
    };

    const response = await request.post('/api/leads', {data: leadPayload});

    expect(response.status()).toBe(201);
    const body = await response.json() as {
      ok?: boolean;
      leadId?: string;
      appointmentId?: string | null;
    };

    expect(body.ok).toBe(true);
    expect(body.leadId).toBeTruthy();
    expect(body.appointmentId).toBeTruthy();

    const leadId = body.leadId as string;
    const appointmentId = body.appointmentId as string;

    const {data: lead, error: leadError} = await supabase
      .from('leads')
      .select('id, utm_campaign, source')
      .eq('id', leadId)
      .single();
    expect(leadError).toBeNull();
    expect(lead).toMatchObject({
      id: leadId,
      utm_campaign: bookingMarker,
      source: 'p24_production_smoke'
    });

    const {data: appointment, error: appointmentError} = await supabase
      .from('lead_appointments')
      .select('id, lead_id, status, source, customer_note')
      .eq('id', appointmentId)
      .single();
    expect(appointmentError).toBeNull();
    expect(appointment).toMatchObject({
      id: appointmentId,
      lead_id: leadId,
      status: 'pending',
      source: 'customer',
      customer_note: bookingMarker
    });

    const {data: history, error: historyError} = await supabase
      .from('lead_appointment_history')
      .select('id, appointment_id, lead_id, event_type')
      .eq('appointment_id', appointmentId)
      .eq('event_type', 'created');
    expect(historyError).toBeNull();
    expect(history).toHaveLength(1);
    expect(history?.[0]).toMatchObject({
      appointment_id: appointmentId,
      lead_id: leadId,
      event_type: 'created'
    });

    createdLeadIds.push({id: leadId, marker: bookingMarker});
    createdAppointments.push({id: appointmentId, leadId, marker: bookingMarker});
  });

  test('invalid appointment aborts the atomic RPC without leaving an orphan lead', async () => {
    const pastScheduledAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const leadPayload = {
      ...buildProductionLeadPayload(atomicMarker),
      phone: '00000002',
      message: atomicMarker,
      utmCampaign: atomicMarker
    };

    const {error} = await supabase.rpc('submit_public_lead_request', {
      p_lead: leadPayload,
      p_appointment: {
        scheduledAt: pastScheduledAt,
        durationMinutes: 30,
        customerNote: atomicMarker
      }
    });

    expect(error).not.toBeNull();

    const {count, error: countError} = await supabase
      .from('leads')
      .select('id', {count: 'exact', head: true})
      .eq('utm_campaign', atomicMarker);

    expect(countError).toBeNull();
    expect(count).toBe(0);
  });

  test.afterAll(async () => {
    for (const appointmentRef of createdAppointments) {
      const {data: appointment, error: appointmentReadError} = await supabase
        .from('lead_appointments')
        .select('id, lead_id, customer_note')
        .eq('id', appointmentRef.id)
        .maybeSingle();
      throwOnError(appointmentReadError, 'appointment_cleanup_read_failed');
      assertAppointmentCleanupTarget(
        appointment,
        appointmentRef.id,
        appointmentRef.leadId,
        appointmentRef.marker
      );

      const {error: historyDeleteError} = await supabase
        .from('lead_appointment_history')
        .delete()
        .eq('appointment_id', appointmentRef.id);
      throwOnError(historyDeleteError, 'appointment_history_cleanup_failed');

      const {error: appointmentDeleteError} = await supabase
        .from('lead_appointments')
        .delete()
        .eq('id', appointmentRef.id);
      throwOnError(appointmentDeleteError, 'appointment_cleanup_failed');
    }

    for (const leadRef of createdLeadIds) {
      const {data: lead, error: leadReadError} = await supabase
        .from('leads')
        .select('id, utm_campaign')
        .eq('id', leadRef.id)
        .maybeSingle();
      throwOnError(leadReadError, 'lead_cleanup_read_failed');
      assertLeadCleanupTarget(lead, leadRef.id, leadRef.marker);

      const {error: leadDeleteError} = await supabase
        .from('leads')
        .delete()
        .eq('id', leadRef.id);
      throwOnError(leadDeleteError, 'lead_cleanup_failed');
    }

    const {count: leadCount, error: leadCountError} = await supabase
      .from('leads')
      .select('id', {count: 'exact', head: true})
      .in('utm_campaign', [marker, bookingMarker, atomicMarker]);
    throwOnError(leadCountError, 'lead_cleanup_verification_failed');
    expect(leadCount).toBe(0);

    const {count: appointmentCount, error: appointmentCountError} = await supabase
      .from('lead_appointments')
      .select('id', {count: 'exact', head: true})
      .eq('customer_note', bookingMarker);
    throwOnError(appointmentCountError, 'appointment_cleanup_verification_failed');
    expect(appointmentCount).toBe(0);

    if (createdAppointments.length > 0) {
      const {count: historyCount, error: historyCountError} = await supabase
        .from('lead_appointment_history')
        .select('id', {count: 'exact', head: true})
        .in('appointment_id', createdAppointments.map((item) => item.id));
      throwOnError(historyCountError, 'history_cleanup_verification_failed');
      expect(historyCount).toBe(0);
    }
  });
});
