import 'server-only';

import {createSupabaseServerClient} from '@/lib/supabase/server';

type ContactValue = {
  phone?: string | null;
  zalo_url?: string | null;
  email?: string | null;
  opening_hours?: Record<string, unknown> | null;
};

export type PublicSiteSettings = {
  phone: string | null;
  zaloUrl: string | null;
  email: string | null;
  openingHours: Record<string, unknown>;
};

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'public_contact')
    .eq('is_public', true)
    .maybeSingle();
  if (error) throw error;

  const value = (data?.value ?? {}) as ContactValue;
  return {
    phone: value.phone ?? null,
    zaloUrl: value.zalo_url ?? null,
    email: value.email ?? null,
    openingHours: value.opening_hours ?? {}
  };
}
