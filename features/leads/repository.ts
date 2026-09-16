import 'server-only';

import {createSupabaseAdminClient} from '@/lib/supabase/admin';
import type {PublicLeadRequest} from './request-schema';

export async function insertLeadRequest(input: PublicLeadRequest) {
  const supabase = createSupabaseAdminClient();
  const {data, error} = await supabase.rpc('submit_public_lead_request', {
    p_lead: {
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      preferredLanguage: input.preferredLanguage,
      locationId: input.locationId ?? null,
      unitTypeId: input.unitTypeId ?? null,
      needType: input.needType,
      estimatedVolume: input.estimatedVolume,
      message: input.message ?? null,
      source: input.source ?? input.utmSource ?? null,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmContent: input.utmContent ?? null,
      landingPage: input.landingPage ?? null,
      referrer: input.referrer ?? null
    },
    p_appointment: input.appointment ? {
      scheduledAt: input.appointment.scheduledAt,
      durationMinutes: input.appointment.durationMinutes,
      customerNote: input.appointment.customerNote ?? null
    } : null
  });

  if (error) throw error;
  const result = data as {lead_id?: string; appointment_id?: string | null} | null;
  if (!result?.lead_id) throw new Error('Lead request RPC did not return a lead id');
  return {leadId: result.lead_id, appointmentId: result.appointment_id ?? null};
}
