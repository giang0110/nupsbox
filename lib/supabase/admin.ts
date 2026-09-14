import 'server-only';

import {createClient} from '@supabase/supabase-js';
import type {Database} from '@/types/database';

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw new Error('Missing server Supabase configuration');

  return createClient<Database>(url, serviceRole, {
    auth: {persistSession: false, autoRefreshToken: false}
  });
}
