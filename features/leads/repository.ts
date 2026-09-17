import 'server-only';

import {createSupabaseAdminClient} from '@/lib/supabase/admin';
import type {LeadInput} from './schema';
import type {PublicLeadRequest} from './request-schema';

type LeadRequestRpcResult = {
  data: unknown;
  error: unknown | null;
};

type LeadRequestRpcClient = {
  rpc: (
    name: 'submit_public_lead_request',
    args: {
      p_lead: Record<string, unknown>;
      p_appointment: Record<string, unknown> | null;
    }
  ) => PromiseLike<LeadRequestRpcResult>;
};

export async function insertLeadRequest(input: PublicLeadRequest) {
  const supabase = createSupabaseAdminClient();
  // `types/database.ts` reflects the currently deployed production schema (00300).
  // Migration 00400 stays feature-branch-only until the explicit production gate,
  // so type this new RPC locally rather than pretending production already exposes it.
  const rpcClient = supabase as unknown as LeadRequestRpcClient;
  const {data, error} = await rpcClient.rpc('submit_public_lead_request', {
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

  return {
    leadId: result.lead_id,
    appointmentId: result.appointment_id ?? null
  };
}

// Preserve the Phase 1 repository contract for any internal callers that still
// create a lead-only request. It now benefits from the same atomic RPC path.
export async function insertLead(input: LeadInput) {
  const result = await insertLeadRequest(input);
  return result.leadId;
}
