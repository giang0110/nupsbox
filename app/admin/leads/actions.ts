'use server';

import {revalidatePath} from 'next/cache';
import type {AdminActionResult} from '@/features/admin/action-result';
import {
  prepareLeadAssignment,
  prepareLeadNote,
  prepareLeadStatusUpdate
} from '@/features/admin/leads';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppRole} from '@/types/database';

function revalidateLeadWorkspace(leadId: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath('/admin/leads/' + leadId);
}

async function performLeadStatusUpdate(
  role: AppRole,
  leadId: string,
  rawStatus: unknown
) {
  const prepared = prepareLeadStatusUpdate(role, leadId, rawStatus);
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('leads')
    .update({status: prepared.status})
    .eq('id', prepared.leadId)
    .select('id')
    .single();

  if (error) throw error;
  if (!data) throw new Error('lead_status_update_noop');
  revalidateLeadWorkspace(prepared.leadId);
}

async function performLeadAssignment(
  role: AppRole,
  leadId: string,
  rawAssigneeId: string | null
) {
  const prepared = prepareLeadAssignment(role, leadId, rawAssigneeId);
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('leads')
    .update({assigned_to: prepared.assigneeId})
    .eq('id', prepared.leadId)
    .select('id')
    .single();

  if (error) throw error;
  if (!data) throw new Error('lead_assignment_noop');
  revalidateLeadWorkspace(prepared.leadId);
}

async function performLeadNote(
  role: AppRole,
  authorId: string,
  leadId: string,
  rawNote: unknown
) {
  const prepared = prepareLeadNote(role, leadId, rawNote);
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('lead_notes').insert({
    lead_id: prepared.leadId,
    author_id: authorId,
    note: prepared.note
  });

  if (error) throw error;
  revalidateLeadWorkspace(prepared.leadId);
}

export async function updateLeadStatusValue(
  leadId: string,
  status: string
): Promise<AdminActionResult> {
  const session = await requireAdminUser();

  try {
    await performLeadStatusUpdate(session.role, leadId, status);
    return {ok: true};
  } catch {
    return {
      ok: false,
      message: 'Không thể cập nhật trạng thái. Vui lòng thử lại.'
    };
  }
}

export async function assignLeadValue(
  leadId: string,
  assigneeId: string
): Promise<AdminActionResult> {
  const session = await requireAdminUser();

  try {
    await performLeadAssignment(
      session.role,
      leadId,
      assigneeId.trim() || null
    );
    return {ok: true};
  } catch {
    return {
      ok: false,
      message: 'Không thể cập nhật người phụ trách. Vui lòng thử lại.'
    };
  }
}

export async function addLeadNoteValue(
  leadId: string,
  note: string
): Promise<AdminActionResult> {
  const session = await requireAdminUser();

  try {
    await performLeadNote(session.role, session.user.id, leadId, note);
    return {ok: true};
  } catch {
    return {
      ok: false,
      message: 'Không thể lưu ghi chú. Vui lòng thử lại.'
    };
  }
}

export async function updateLeadStatus(formData: FormData) {
  const session = await requireAdminUser();
  await performLeadStatusUpdate(
    session.role,
    String(formData.get('leadId') ?? ''),
    formData.get('status')
  );
}

export async function assignLead(formData: FormData) {
  const session = await requireAdminUser();
  const rawAssigneeId = String(formData.get('assigneeId') ?? '').trim();
  await performLeadAssignment(
    session.role,
    String(formData.get('leadId') ?? ''),
    rawAssigneeId || null
  );
}

export async function addLeadNote(formData: FormData) {
  const session = await requireAdminUser();
  await performLeadNote(
    session.role,
    session.user.id,
    String(formData.get('leadId') ?? ''),
    formData.get('note')
  );
}
