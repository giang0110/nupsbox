'use server';

import {revalidatePath} from 'next/cache';
import {
  prepareLeadAssignment,
  prepareLeadNote,
  prepareLeadStatusUpdate
} from '@/features/admin/leads';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

function revalidateLeadWorkspace(leadId: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function updateLeadStatus(formData: FormData) {
  const session = await requireAdminUser();
  const {leadId, status} = prepareLeadStatusUpdate(
    session.role,
    String(formData.get('leadId') ?? ''),
    formData.get('status')
  );
  const supabase = await createSupabaseServerClient();

  const {error} = await supabase.from('leads').update({status}).eq('id', leadId);
  if (error) throw error;

  revalidateLeadWorkspace(leadId);
}

export async function assignLead(formData: FormData) {
  const session = await requireAdminUser();
  const rawAssigneeId = String(formData.get('assigneeId') ?? '').trim();
  const {leadId, assigneeId} = prepareLeadAssignment(
    session.role,
    String(formData.get('leadId') ?? ''),
    rawAssigneeId || null
  );
  const supabase = await createSupabaseServerClient();

  const {error} = await supabase
    .from('leads')
    .update({assigned_to: assigneeId})
    .eq('id', leadId);
  if (error) throw error;

  revalidateLeadWorkspace(leadId);
}

export async function addLeadNote(formData: FormData) {
  const session = await requireAdminUser();
  const {leadId, note} = prepareLeadNote(
    session.role,
    String(formData.get('leadId') ?? ''),
    formData.get('note')
  );
  const supabase = await createSupabaseServerClient();

  const {error} = await supabase.from('lead_notes').insert({
    lead_id: leadId,
    author_id: session.user.id,
    note
  });
  if (error) throw error;

  revalidateLeadWorkspace(leadId);
}
