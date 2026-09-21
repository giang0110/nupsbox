'use server';

import {revalidatePath} from 'next/cache';
import {
  AppointmentConflictError,
  prepareAppointmentCreate,
  prepareAppointmentUpdate,
  toAppointmentUpdatePatch,
  type AppointmentMutationCurrent
} from '@/features/admin/appointments';
import {requirePermission} from '@/features/admin/mutation-guard';
import {AppointmentUpdateInputSchema} from '@/features/appointments/schema';
import {hoChiMinhLocalToIso} from '@/features/appointments/time';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

function optionalFormText(formData: FormData, name: string): string | undefined {
  return formData.has(name) ? formText(formData, name) : undefined;
}

function optionalDuration(formData: FormData): string | undefined {
  const value = formText(formData, 'durationMinutes').trim();
  return value || undefined;
}

function localDateTimeInput(formData: FormData, name: string): string | undefined {
  const value = formText(formData, name).trim();
  return value ? hoChiMinhLocalToIso(value) : undefined;
}

function createAppointmentInput(formData: FormData) {
  return {
    leadId: formText(formData, 'leadId'),
    locationId: optionalFormText(formData, 'locationId'),
    unitTypeId: optionalFormText(formData, 'unitTypeId'),
    assignedTo: optionalFormText(formData, 'assignedTo'),
    scheduledAt: localDateTimeInput(formData, 'scheduledAtLocal'),
    durationMinutes: optionalDuration(formData),
    customerNote: optionalFormText(formData, 'customerNote'),
    internalNote: optionalFormText(formData, 'internalNote')
  };
}

function updateAppointmentInput(formData: FormData) {
  return {
    appointmentId: formText(formData, 'appointmentId'),
    leadId: formText(formData, 'leadId'),
    expectedUpdatedAt: formText(formData, 'expectedUpdatedAt'),
    locationId: optionalFormText(formData, 'locationId'),
    unitTypeId: optionalFormText(formData, 'unitTypeId'),
    assignedTo: optionalFormText(formData, 'assignedTo'),
    scheduledAt: localDateTimeInput(formData, 'scheduledAtLocal'),
    durationMinutes: optionalDuration(formData),
    status: optionalFormText(formData, 'status'),
    customerNote: optionalFormText(formData, 'customerNote'),
    internalNote: optionalFormText(formData, 'internalNote')
  };
}

function revalidateAppointmentWorkspace(leadId: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function createAppointment(formData: FormData) {
  const session = await requireAdminUser();
  const prepared = prepareAppointmentCreate(session.role, createAppointmentInput(formData));
  const supabase = await createSupabaseServerClient();

  const {data: lead, error: leadError} = await supabase
    .from('leads')
    .select('id, assigned_to')
    .eq('id', prepared.leadId)
    .maybeSingle();
  if (leadError) throw leadError;
  if (!lead) throw new Error('lead_not_found');

  const assignedTo = formData.has('assignedTo')
    ? prepared.assignedTo ?? null
    : lead.assigned_to;
  const {error} = await supabase.from('lead_appointments').insert({
    lead_id: prepared.leadId,
    location_id: prepared.locationId ?? null,
    unit_type_id: prepared.unitTypeId ?? null,
    assigned_to: assignedTo,
    scheduled_at: prepared.scheduledAt,
    duration_minutes: prepared.durationMinutes,
    status: 'pending',
    source: 'staff',
    customer_note: prepared.customerNote ?? null,
    internal_note: prepared.internalNote ?? null,
    created_by: session.user.id
  });
  if (error) throw error;

  revalidateAppointmentWorkspace(prepared.leadId);
}

export async function updateAppointment(formData: FormData) {
  const session = await requireAdminUser();
  requirePermission(session.role, 'leads:update');
  const parsed = AppointmentUpdateInputSchema.parse(updateAppointmentInput(formData));
  const supabase = await createSupabaseServerClient();

  const {data: current, error: currentError} = await supabase
    .from('lead_appointments')
    .select('id, lead_id, status, location_id, unit_type_id, assigned_to, scheduled_at, updated_at')
    .eq('id', parsed.appointmentId)
    .eq('lead_id', parsed.leadId)
    .maybeSingle();
  if (currentError) throw currentError;
  if (!current) throw new Error('appointment_not_found');

  const currentAppointment: AppointmentMutationCurrent = {
    id: current.id,
    leadId: current.lead_id,
    status: current.status,
    locationId: current.location_id,
    unitTypeId: current.unit_type_id,
    assignedTo: current.assigned_to,
    scheduledAt: current.scheduled_at,
    updatedAt: current.updated_at
  };
  const prepared = prepareAppointmentUpdate(session.role, currentAppointment, parsed);
  const patch = toAppointmentUpdatePatch(parsed);
  if (!Object.keys(patch).length) throw new Error('invalid_appointment_update');

  const {data, error} = await supabase
    .from('lead_appointments')
    .update(patch)
    .eq('id', prepared.appointmentId)
    .eq('lead_id', prepared.leadId)
    .eq('updated_at', prepared.expectedUpdatedAt)
    .select('id, updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new AppointmentConflictError();

  revalidateAppointmentWorkspace(prepared.leadId);
}
