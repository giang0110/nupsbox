import 'server-only';

import type {User} from '@supabase/supabase-js';
import {createSupabaseAdminClient} from '@/lib/supabase/admin';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppRole} from '@/types/database';

export type AdminUserRow = {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  authCreatedAt: string | null;
  fullName: string | null;
  role: AppRole;
  active: boolean;
  profileCreatedAt: string;
  updatedAt: string;
};

export type AdminUserDirectory = {
  users: AdminUserRow[];
  authDirectoryAvailable: boolean;
};

function authUserMap(users: User[]) {
  return new Map(users.map(user => [user.id, user]));
}

export async function listAdminUsers(): Promise<AdminUserDirectory> {
  const supabase = await createSupabaseServerClient();
  const {data: profiles, error} = await supabase
    .from('profiles')
    .select('id, full_name, role, active, created_at, updated_at')
    .order('created_at', {ascending: false});

  if (error) throw error;

  let authUsers = new Map<string, User>();
  let authDirectoryAvailable = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createSupabaseAdminClient();
      const {data, error: authError} = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (authError) throw authError;
      authUsers = authUserMap(data.users);
      authDirectoryAvailable = true;
    } catch (authError) {
      console.error('admin_user_directory_auth_enrichment_failed', authError);
    }
  }

  return {
    authDirectoryAvailable,
    users: (profiles ?? []).map(profile => {
      const authUser = authUsers.get(profile.id);
      return {
        id: profile.id,
        email: authUser?.email ?? null,
        emailConfirmedAt: authUser?.email_confirmed_at ?? null,
        lastSignInAt: authUser?.last_sign_in_at ?? null,
        authCreatedAt: authUser?.created_at ?? null,
        fullName: profile.full_name,
        role: profile.role as AppRole,
        active: profile.active,
        profileCreatedAt: profile.created_at,
        updatedAt: profile.updated_at
      };
    })
  };
}
