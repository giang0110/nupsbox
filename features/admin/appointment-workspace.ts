import 'server-only';

import type {SupabaseClient} from '@supabase/supabase-js';
import {
  projectAppointmentWorkspace,
  type AppointmentWorkspace
} from '@/features/admin/appointment-read-model';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {
  DatabaseWithAppointments,
  LeadAppointmentHistoryRow,
  LeadAppointmentRow
} from '@/types/appointment-database';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function appointmentClient() {
  const client = await createSupabaseServerClient();
  return client as unknown as SupabaseClient<DatabaseWithAppointments>;
}

export async function getAdminAppointmentWorkspace(leadId: string): Promise<AppointmentWorkspace> {
  if (!uuidPattern.test(leadId)) {
    return projectAppointmentWorkspace({
      appointments: [], history: [], locations: [], unitTypes: [], profiles: []
    });
  }

  const supabase = await appointmentClient();
  const [appointmentsResult, historyResult, locationsResult, unitTypesResult, profilesResult] = await Promise.all([
    supabase
      .from('lead_appointments')
      .select('*')
      .eq('lead_id', leadId)
      .order('scheduled_at', {ascending: false}),
    supabase
      .from('lead_appointment_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', {ascending: false})
      .limit(200),
    supabase
      .from('locations')
      .select('id, name_vi')
      .eq('status', 'active')
      .order('sort_order', {ascending: true}),
    supabase
      .from('unit_types')
      .select('id, name_vi')
      .eq('active', true)
      .order('sort_order', {ascending: true}),
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('active', true)
      .in('role', ['admin', 'staff'])
      .order('full_name', {ascending: true})
  ]);

  if (appointmentsResult.error) throw appointmentsResult.error;
  if (historyResult.error) throw historyResult.error;
  if (locationsResult.error) throw locationsResult.error;
  if (unitTypesResult.error) throw unitTypesResult.error;
  if (profilesResult.error) throw profilesResult.error;

  return projectAppointmentWorkspace({
    appointments: (appointmentsResult.data ?? []) as LeadAppointmentRow[],
    history: (historyResult.data ?? []) as LeadAppointmentHistoryRow[],
    locations: locationsResult.data ?? [],
    unitTypes: unitTypesResult.data ?? [],
    profiles: (profilesResult.data ?? []).flatMap((row) => {
      if (row.role !== 'admin' && row.role !== 'staff') return [];
      return [{id: row.id, full_name: row.full_name, role: row.role}];
    })
  });
}
