import 'server-only';

import {createSupabaseAdminClient} from '@/lib/supabase/admin';
import type {LeadInput} from './schema';

export async function insertLead(input: LeadInput) {
  const supabase = createSupabaseAdminClient();
  const {data, error} = await supabase
    .from('leads')
    .insert({
      full_name: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      preferred_language: input.preferredLanguage,
      location_id: input.locationId ?? null,
      unit_type_id: input.unitTypeId ?? null,
      need_type: input.needType,
      estimated_volume: input.estimatedVolume,
      message: input.message ?? null,
      source: input.source ?? input.utmSource ?? null,
      utm_source: input.utmSource ?? null,
      utm_medium: input.utmMedium ?? null,
      utm_campaign: input.utmCampaign ?? null,
      utm_content: input.utmContent ?? null,
      landing_page: input.landingPage ?? null,
      referrer: input.referrer ?? null,
      status: 'new'
    })
    .select('id')
    .single();

  if (error) throw error;
  const leadId = (data as {id?: string} | null)?.id;
  if (!leadId) throw new Error('Lead insert did not return an id');
  return leadId;
}
