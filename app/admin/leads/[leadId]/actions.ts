'use server';

import type {SupabaseClient} from '@supabase/supabase-js';
import {revalidatePath} from 'next/cache';
import {
  appointmentCreatePayloadFromFormData,
  appointmentUpdatePayloadFromFormData,
  assertAppointmentWriteResult,
  prepareAppointmentCreate,
  prepareAppointmentUpdate,
  toAppointmentInsertRow,
  toAppointmentUpdatePatch,
  type CurrentAppointment
} from '@/features/admin/appointments';
import {hoChiMinhLocalToIso} from '@/features/appointments/time';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {DatabaseWithAppointments, LeadAppointmentRow} from '@/types/appointment-database';

function revalidateLeadWorkspace(leadId: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${leadId}`);
}

async function appointmentClient() {
  const client = await createSupabaseServerClient();
  return client as unknown as SupabaseClient<DatabaseWithAppointments>;
}

function mapCurrentAppointment(row: LeadAppointmentRow): CurrentAppointment {
  return {
    id: row.id,
    leadId: row.lead_id,
    status: row.status,
    locationId: row.location_id,
    unitTypeId: row.unit_type_id,
    assignedTo: row.assigned_to,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    customerNote: row.customer_note,
    internalNote: row.internal_note,
    updatedAt: row.updated_at
  };
}

export async function createAppointment(formData: FormData) {
  const session = await requireAdminUser();
  const raw = appointmentCreatePayloadFromFormData(formData);
  const parsed = prepareAppointmentCreate(session.role, {
    leadId: raw.leadId,
    locationId: raw.locationId,
    unitTypeId: raw.unitTypeId,
    assignedTo: raw.assignedTo,
    scheduledAt: hoChiMinhLocalToIso(raw.scheduledAtLocal),
    durationMinutes: raw.durationMinutes,
    customerNote: raw.customerNote,
    internalNote: raw.internalNote
  });

  const supabase = await appointmentClient();
  const {error} = await supabase
    .from('lead_appointments')
    .insert(toAppointmentInsertRow(parsed, session.user.id));
  if (error) throw error;

  revalidateLeadWorkspace(parsed.leadId);
}

export async function updateAppointment(formData: FormData) {
  const session = await requireAdminUser();
  const raw = appointmentUpdatePayloadFromFormData(formData);
  const supabase = await appointmentClient();

  const {data: currentRow, error: currentError} = await supabase
    .from('lead_appointments')
    .select('*')
    .eq('id', raw.appointmentId)
    .eq('lead_id', raw.leadId)
    .maybeSingle();
  if (currentError) throw currentError;
  if (!currentRow) throw new Error('appointment_not_found');

  const parsed = prepareAppointmentUpdate(session.role, mapCurrentAppointment(currentRow), {
    appointmentId: raw.appointmentId,
    leadId: raw.leadId,
    expectedUpdatedAt: raw.expectedUpdatedAt,
    status: raw.status || undefined,
    locationId: raw.locationId,
    unitTypeId: raw.unitTypeId,
    assignedTo: raw.assignedTo,
    scheduledAt: raw.scheduledAtLocal ? hoChiMinhLocalToIso(raw.scheduledAtLocal) : undefined,
    durationMinutes: raw.durationMinutes || undefined,
    customerNote: raw.customerNote,
    internalNote: raw.internalNote
  });

  const {data: updatedRow, error: updateError} = await supabase
    .from('lead_appointments')
    .update(toAppointmentUpdatePatch(parsed))
    .eq('id', parsed.appointmentId)
    .eq('lead_id', parsed.leadId)
    .eq('updated_at', parsed.expectedUpdatedAt)
    .select('id, updated_at')
    .maybeSingle();
  if (updateError) throw updateError;
  assertAppointmentWriteResult(updatedRow);

  revalidateLeadWorkspace(parsed.leadId);
}
