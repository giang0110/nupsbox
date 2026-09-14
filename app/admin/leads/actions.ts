'use server';

import {revalidatePath} from 'next/cache';
import {prepareLeadStatusUpdate} from '@/features/admin/leads';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export async function updateLeadStatus(formData: FormData) {
  const session = await requireAdminUser();
  const {leadId, status} = prepareLeadStatusUpdate(
    session.role,
    String(formData.get('leadId') ?? ''),
    formData.get('status')
  );
  const supabase = await createSupabaseServerClient();

  const {data: current, error: currentError} = await supabase
    .from('leads')
    .select('status')
    .eq('id', leadId)
    .single();
  if (currentError) throw currentError;

  const fromStatus = typeof current.status === 'string' ? current.status : null;
  if (fromStatus === status) return;

  const {error: updateError} = await supabase
    .from('leads')
    .update({status, updated_at: new Date().toISOString()})
    .eq('id', leadId);
  if (updateError) throw updateError;

  const {error: historyError} = await supabase.from('lead_status_history').insert({
    lead_id: leadId,
    from_status: fromStatus,
    to_status: status,
    changed_by: session.user.id
  });
  if (historyError) throw historyError;

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
}
