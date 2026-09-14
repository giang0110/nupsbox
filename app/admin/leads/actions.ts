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

  const {error} = await supabase.from('leads').update({status}).eq('id', leadId);
  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
}
