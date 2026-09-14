import 'server-only';

import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppRole} from '@/types/database';

export type AdminSession = {
  user: {id: string; email?: string};
  role: AppRole;
  fullName: string | null;
};

export async function requireAdminUser(): Promise<AdminSession> {
  const supabase = await createSupabaseServerClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const {data: profile} = await supabase
    .from('profiles')
    .select('full_name, role, active')
    .eq('id', user.id)
    .single();

  if (!profile?.active || !profile.role) redirect('/auth/login?error=forbidden');

  return {
    user: {id: user.id, email: user.email},
    role: profile.role as AppRole,
    fullName: profile.full_name
  };
}
