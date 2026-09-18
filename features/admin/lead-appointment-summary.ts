import type {SupabaseClient} from '@supabase/supabase-js';
import {selectNextAppointment} from '@/features/admin/lead-detail';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {DatabaseWithAppointments} from '@/types/appointment-database';

export type LeadAppointmentSummaryRow = {
  id: string;
  leadId: string;
  status: 'pending' | 'confirmed';
  scheduledAt: string;
};

export type AdminLeadAppointmentSummary = LeadAppointmentSummaryRow & {
  overdue: boolean;
};

export function projectLeadAppointmentSummaries(
  rows: readonly LeadAppointmentSummaryRow[],
  leadIds: readonly string[],
  now = new Date()
): Record<string, AdminLeadAppointmentSummary> {
  return Object.fromEntries(
    leadIds.flatMap((leadId) => {
      const selected = selectNextAppointment(
        rows
          .filter((row) => row.leadId === leadId)
          .map((row) => ({
            id: row.id,
            status: row.status,
            scheduledAt: row.scheduledAt
          })),
        now
      );

      if (!selected) return [];
      if (selected.status !== 'pending' && selected.status !== 'confirmed') {
        return [];
      }

      const summary: AdminLeadAppointmentSummary = {
        id: selected.id,
        leadId,
        status: selected.status,
        scheduledAt: selected.scheduledAt,
        overdue: selected.overdue
      };

      return [[leadId, summary]];
    })
  );
}

export async function listAdminLeadAppointmentSummaries(
  leadIds: readonly string[],
  now = new Date()
): Promise<Record<string, AdminLeadAppointmentSummary>> {
  const ids = [...new Set(leadIds)].slice(0, 100);
  if (ids.length === 0) return {};

  const supabase = await createSupabaseServerClient();
  const client = supabase as unknown as SupabaseClient<DatabaseWithAppointments>;
  const nowIso = now.toISOString();

  const [future, past] = await Promise.all([
    client
      .from('lead_appointments')
      .select('id, lead_id, status, scheduled_at')
      .in('lead_id', ids)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', nowIso)
      .order('scheduled_at', {ascending: true})
      .limit(500),
    client
      .from('lead_appointments')
      .select('id, lead_id, status, scheduled_at')
      .in('lead_id', ids)
      .in('status', ['pending', 'confirmed'])
      .lt('scheduled_at', nowIso)
      .order('scheduled_at', {ascending: false})
      .limit(500)
  ]);

  if (future.error) throw future.error;
  if (past.error) throw past.error;

  const rows = [...(future.data ?? []), ...(past.data ?? [])].flatMap((row) => {
    if (row.status !== 'pending' && row.status !== 'confirmed') return [];

    return [{
      id: row.id,
      leadId: row.lead_id,
      status: row.status,
      scheduledAt: row.scheduled_at
    }];
  });

  return projectLeadAppointmentSummaries(rows, ids, now);
}
